import pool from "./db";
import { invalidatePrefix } from "./cache";

// One-time historical backfill of finished matches + highlight clips from
// Highlightly into the scores table. ESPN only ingests ~3 days back and past
// rounds predate the pipeline, so the competition pages have no older results
// or highlights. This fills that gap.
//
// Scoped to matches MORE than 7 days old so it can never duplicate a row ESPN
// already owns (ESPN's effective window). Rows are written as `hl-<id>` with
// source 'highlightly'. Guarded by a settings flag so it runs exactly once,
// even across restarts/redeploys.

interface HLMatch {
  id: number;
  date?: string;
  homeTeam?: { name?: string; logo?: string };
  awayTeam?: { name?: string; logo?: string };
  state?: { description?: string; score?: string };
}

function parseScore(s?: string): [number | null, number | null] {
  const m = s?.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  return m ? [Number(m[1]), Number(m[2])] : [null, null];
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function alreadyRan(flagKey: string): Promise<boolean> {
  const { rows } = await pool.query("SELECT 1 FROM settings WHERE key=$1", [flagKey]);
  return rows.length > 0;
}

async function markRan(flagKey: string, summary: string) {
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ($1,$2)
     ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`,
    [flagKey, summary]
  );
}

/**
 * Backfill one league's finished matches that have highlight clips.
 * @param leagueId        Highlightly league id
 * @param competitionName value to store in scores.competition (must match the
 *                        competition page's dbCompetitionNames, e.g. "French Top 14")
 * @param flagKey         settings key that marks this backfill as done
 * @param oldestDaysAgo   how far back to look (default 40)
 */
export async function backfillLeagueHighlights(
  leagueId: number,
  competitionName: string,
  flagKey: string,
  oldestDaysAgo = 40,
): Promise<void> {
  const key = process.env.HIGHLIGHTLY_API_KEY;
  if (!key) return;
  if (await alreadyRan(flagKey)) return;

  await pool.query("ALTER TABLE scores ADD COLUMN IF NOT EXISTS highlight_url TEXT");
  await pool.query("ALTER TABLE scores ADD COLUMN IF NOT EXISTS home_logo TEXT");
  await pool.query("ALTER TABLE scores ADD COLUMN IF NOT EXISTS away_logo TEXT");

  const headers = { "x-rapidapi-key": key };
  const api = async <T>(path: string): Promise<T> => {
    const res = await fetch(`https://rugby.highlightly.net${path}`, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return res.json() as Promise<T>;
  };

  let inserted = 0;
  let scanned = 0;
  // Start at 8 days ago so we never touch ESPN's recent window
  for (let d = 8; d <= oldestDaysAgo; d++) {
    const date = isoDaysAgo(d);
    let matches: HLMatch[] = [];
    try {
      const body = await api<{ data?: HLMatch[] }>(`/matches?date=${date}&leagueId=${leagueId}&limit=100`);
      matches = (body.data ?? []).filter((m) => /finish/i.test(m.state?.description ?? ""));
    } catch (err) {
      console.error(`[backfill ${flagKey}] matches ${date} failed:`, err instanceof Error ? err.message : err);
      continue;
    }
    for (const m of matches) {
      scanned++;
      let clip: string | undefined;
      try {
        const hl = await api<{ data?: Array<{ url?: string; embedUrl?: string }> }>(`/highlights?matchId=${m.id}&limit=5`);
        clip = hl.data?.find((c) => c.url || c.embedUrl)?.url ?? hl.data?.find((c) => c.embedUrl)?.embedUrl;
      } catch {
        continue; // skip on clip-fetch error
      }
      if (!clip) continue; // only backfill matches that actually have a highlight

      const [home, away] = parseScore(m.state?.score);
      try {
        await pool.query(
          `INSERT INTO scores (id, competition, home_team, away_team, home_score, away_score, match_date, status, source, highlight_url, home_logo, away_logo)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT (id) DO UPDATE SET highlight_url=EXCLUDED.highlight_url`,
          [`hl-${m.id}`, competitionName, m.homeTeam?.name ?? "TBC", m.awayTeam?.name ?? "TBC",
           home, away, (m.date ?? date).slice(0, 10), "FT", "highlightly", clip,
           m.homeTeam?.logo ?? null, m.awayTeam?.logo ?? null]
        );
        inserted++;
      } catch (err) {
        console.error(`[backfill ${flagKey}] upsert failed for ${m.id}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  await markRan(flagKey, JSON.stringify({ at: new Date().toISOString(), inserted, scanned }));
  if (inserted > 0) invalidatePrefix("fixtures:");
  console.log(`[backfill ${flagKey}] done: ${inserted} match(es) with highlights backfilled (${scanned} finished scanned)`);
}
