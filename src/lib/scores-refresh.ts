import pool from "./db";
import { invalidatePrefix } from "./cache";
import type { Score } from "@/app/api/scores/route";

// Single owner of the ESPN → DB fixtures/scores pipeline.
// Called directly (no HTTP self-fetch) from:
//   - the in-process 15-minute cron (instrumentation.ts)
//   - GET /api/cron/scores (external trigger, kept as redundancy)
//   - GET /api/scores?refresh=1 (hub manual refresh)
// Every run is logged and recorded in the settings table so a stalled
// pipeline is visible instead of silently emptying the fixtures page.

const LEAGUES: { id: number; name: string }[] = [
  { id: 270557, name: "United Rugby Championship" },
  { id: 267979, name: "Gallagher Premiership" },
  { id: 270559, name: "French Top 14" },
  { id: 242041, name: "Super Rugby Pacific" },
  { id: 271937, name: "European Champions Cup" },
  { id: 180659, name: "Six Nations" },
  { id: 244293, name: "Rugby Championship" },
  { id: 289234, name: "International Test Match" },
];

// Days around "now" to request from ESPN. Forward window is wide so the
// fixtures page still has upcoming matches even if the cron stalls for days.
const WINDOW_BACK_DAYS = 3;
const WINDOW_FORWARD_DAYS = 30;

export interface RefreshSummary {
  at: string;
  fetched: number;
  upserted: number;
  failedLeagues: string[];
  durationMs: number;
}

const LAST_REFRESH_KEY = "last_scores_refresh";

interface ESPNEvent {
  id: string;
  date: string;
  competitions: Array<{
    status: { type: { description: string } };
    competitors: Array<{
      homeAway: string;
      team: { displayName: string };
      score: string;
    }>;
  }>;
}

// Returns null on failure (vs [] for "no matches") so failures are countable.
async function fetchESPN(leagueId: number, leagueName: string, dateFrom: Date, dateTo: Date): Promise<Score[] | null> {
  try {
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/rugby/${leagueId}/scoreboard?dates=${fmt(dateFrom)}-${fmt(dateTo)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) {
      console.error(`[scores-refresh] ESPN ${leagueName} returned ${res.status}`);
      return null;
    }
    const data = (await res.json()) as { events: ESPNEvent[] };

    return (data.events || []).map((evt) => {
      const comp = evt.competitions?.[0];
      const home = comp?.competitors?.find((c) => c.homeAway === "home");
      const away = comp?.competitors?.find((c) => c.homeAway === "away");
      const statusDesc = comp?.status?.type?.description || "Scheduled";
      const isFinished = ["Final", "Full Time", "FT"].some((s) =>
        statusDesc.toLowerCase().includes(s.toLowerCase())
      );

      return {
        id: `espn-${leagueId}-${evt.id}`,
        competition: leagueName,
        homeTeam: home?.team?.displayName || "TBC",
        awayTeam: away?.team?.displayName || "TBC",
        homeScore: isFinished && home?.score ? parseInt(home.score) : null,
        awayScore: isFinished && away?.score ? parseInt(away.score) : null,
        matchDate: evt.date,
        status: isFinished ? "FT" : statusDesc,
        source: "espn",
      };
    });
  } catch (err) {
    console.error(`[scores-refresh] ESPN ${leagueName} fetch failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function refreshScores(): Promise<RefreshSummary> {
  const started = Date.now();
  const from = new Date();
  from.setDate(from.getDate() - WINDOW_BACK_DAYS);
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setDate(to.getDate() + WINDOW_FORWARD_DAYS);
  to.setHours(23, 59, 59, 999);

  const results = await Promise.all(LEAGUES.map((l) => fetchESPN(l.id, l.name, from, to)));
  const failedLeagues = LEAGUES.filter((_, i) => results[i] === null).map((l) => l.name);
  const scores = results.flatMap((r) => r ?? []).filter((s) => {
    const d = new Date(s.matchDate);
    return d >= from && d <= to;
  });

  const upserts = await Promise.allSettled(
    scores.map((s) =>
      pool.query(
        `INSERT INTO scores (id, competition, home_team, away_team, home_score, away_score, match_date, status, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score,
           status=EXCLUDED.status, match_date=EXCLUDED.match_date,
           home_team=EXCLUDED.home_team, away_team=EXCLUDED.away_team,
           competition=EXCLUDED.competition`,
        [s.id, s.competition, s.homeTeam, s.awayTeam, s.homeScore, s.awayScore,
         s.matchDate.slice(0, 10), s.status, s.source]
      )
    )
  );
  const upserted = upserts.filter((u) => u.status === "fulfilled").length;
  const failedUpserts = upserts.length - upserted;

  const summary: RefreshSummary = {
    at: new Date().toISOString(),
    fetched: scores.length,
    upserted,
    failedLeagues,
    durationMs: Date.now() - started,
  };

  console.log(
    `[scores-refresh] fetched=${summary.fetched} upserted=${upserted} failedUpserts=${failedUpserts}` +
    `${failedLeagues.length ? ` failedLeagues=${failedLeagues.join(",")}` : ""} in ${summary.durationMs}ms`
  );
  if (failedUpserts > 0) {
    const firstError = upserts.find((u) => u.status === "rejected") as PromiseRejectedResult | undefined;
    console.error(`[scores-refresh] ${failedUpserts} upserts failed, first error:`, firstError?.reason);
  }
  if (upserted > 0) {
    // Fresh scores landed — drop fixture caches so pages re-read the DB
    // instead of waiting out their TTL (which shows a stale-data warning)
    invalidatePrefix("fixtures:");
  }

  // Record the run so pages and humans can see when data was last refreshed.
  // Only counts as a refresh if at least one league responded.
  if (failedLeagues.length < LEAGUES.length) {
    await pool
      .query(
        `INSERT INTO settings (key, value) VALUES ($1,$2)
         ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`,
        [LAST_REFRESH_KEY, JSON.stringify(summary)]
      )
      .catch((err) => console.error("[scores-refresh] failed to record last refresh:", err.message));
  } else {
    console.error("[scores-refresh] all leagues failed — refresh not recorded");
  }

  return summary;
}

export async function getLastScoresRefresh(): Promise<RefreshSummary | null> {
  try {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key=$1", [LAST_REFRESH_KEY]);
    return rows[0] ? (JSON.parse(rows[0].value) as RefreshSummary) : null;
  } catch (err) {
    console.error("[scores-refresh] failed to read last refresh:", err instanceof Error ? err.message : err);
    return null;
  }
}
