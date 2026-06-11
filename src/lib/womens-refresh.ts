import pool from "./db";
import { invalidatePrefix } from "./cache";

// Highlightly → DB ingest for women's rugby. ESPN doesn't carry these
// competitions, so unlike scores-refresh.ts this writes rows sourced from
// Highlightly (ids prefixed "hl-" so they can never collide with ESPN ids).
// Runs hourly from instrumentation.ts; ~34 requests per run (one per date
// in the window) against the 7,500/day plan.

// League ids from Highlightly /leagues. Names here are what lands in
// scores.competition and what the women's page filters on.
export const WOMENS_LEAGUES: { id: number; name: string }[] = [
  { id: 47589, name: "Six Nations Women" },
  { id: 120775, name: "WXV 1" },
  { id: 121626, name: "WXV 2" },
  { id: 122477, name: "WXV 3" },
  { id: 60354, name: "Women's Rugby World Cup" },
  { id: 13549, name: "Premiership Women's Rugby" },
  { id: 83331, name: "Women's International" },
  { id: 123328, name: "Elite 1 Féminine" },
  { id: 116520, name: "Super Rugby Aupiki" },
  { id: 4188, name: "Super W" },
];

export const WOMENS_COMPETITION_NAMES = WOMENS_LEAGUES.map((l) => l.name);

const WINDOW_BACK_DAYS = 3;
const WINDOW_FORWARD_DAYS = 30;

interface HLMatch {
  id: number;
  date?: string;
  homeTeam?: { name?: string; logo?: string };
  awayTeam?: { name?: string; logo?: string };
  league?: { id?: number; name?: string };
  state?: { description?: string; score?: string };
}

let columnsEnsured = false;
async function ensureLogoColumns() {
  if (columnsEnsured) return;
  await pool.query("ALTER TABLE scores ADD COLUMN IF NOT EXISTS home_logo TEXT");
  await pool.query("ALTER TABLE scores ADD COLUMN IF NOT EXISTS away_logo TEXT");
  columnsEnsured = true;
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// "20 - 11" -> [20, 11]; anything unparseable -> [null, null]
function parseScore(s?: string): [number | null, number | null] {
  const m = s?.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  return m ? [Number(m[1]), Number(m[2])] : [null, null];
}

function mapStatus(description?: string): string {
  if (!description) return "Scheduled";
  if (/finished|full.?time|ended/i.test(description)) return "FT";
  if (/not started|scheduled/i.test(description)) return "Scheduled";
  if (/half|progress|live|break/i.test(description)) return "Live";
  return description; // postponed/cancelled etc. shown as-is
}

export async function refreshWomensScores(): Promise<void> {
  const key = process.env.HIGHLIGHTLY_API_KEY;
  if (!key) return; // not configured — feature stays off

  const headers = { "x-rapidapi-key": key };
  const leagueById = new Map(WOMENS_LEAGUES.map((l) => [l.id, l.name]));
  await ensureLogoColumns();

  const matches: HLMatch[] = [];
  let failedDates = 0;
  for (let d = -WINDOW_BACK_DAYS; d <= WINDOW_FORWARD_DAYS; d++) {
    const date = isoDaysFromNow(d);
    try {
      const res = await fetch(`https://rugby.highlightly.net/matches?date=${date}&limit=100`, {
        headers, signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`-> ${res.status}`);
      const body = (await res.json()) as { data?: HLMatch[] };
      matches.push(...(body.data ?? []).filter((m) => leagueById.has(m.league?.id ?? -1)));
    } catch (err) {
      failedDates++;
      console.error(`[womens-refresh] matches fetch failed for ${date}:`, err instanceof Error ? err.message : err);
    }
  }

  const upserts = await Promise.allSettled(
    matches.map((m) => {
      const [home, away] = parseScore(m.state?.score);
      return pool.query(
        `INSERT INTO scores (id, competition, home_team, away_team, home_score, away_score, match_date, status, source, home_logo, away_logo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score,
           status=EXCLUDED.status, match_date=EXCLUDED.match_date,
           home_team=EXCLUDED.home_team, away_team=EXCLUDED.away_team,
           competition=EXCLUDED.competition,
           home_logo=EXCLUDED.home_logo, away_logo=EXCLUDED.away_logo`,
        [`hl-${m.id}`, leagueById.get(m.league?.id ?? -1), m.homeTeam?.name ?? "TBC", m.awayTeam?.name ?? "TBC",
         home, away, (m.date ?? "").slice(0, 10), mapStatus(m.state?.description), "highlightly",
         m.homeTeam?.logo ?? null, m.awayTeam?.logo ?? null]
      );
    })
  );
  const upserted = upserts.filter((u) => u.status === "fulfilled").length;
  const failed = upserts.length - upserted;

  console.log(`[womens-refresh] fetched=${matches.length} upserted=${upserted} failedUpserts=${failed}${failedDates ? ` failedDates=${failedDates}` : ""}`);
  if (failed > 0) {
    const first = upserts.find((u) => u.status === "rejected") as PromiseRejectedResult | undefined;
    console.error(`[womens-refresh] first upsert error:`, first?.reason);
  }
  if (upserted > 0) invalidatePrefix("fixtures:");
}
