import pool from "./db";
import { invalidatePrefix } from "./cache";

// Match-day live scores. Runs every 2 minutes from instrumentation.ts but
// only spends an API request when today has a match that isn't finished —
// quiet days cost nothing. One Highlightly /matches call covers all leagues;
// their match state updates every minute. ESPN remains the source of record
// for fixtures; this only freshens score/status between ESPN's 15-min runs.

const FINISHED = ["FT", "Final", "Full Time", "Postponed", "Cancelled", "Canceled"];

// Same word-overlap matcher as highlights-refresh: names differ between
// sources ("DHL Stormers" vs "Stormers")
function nameWords(name: string): Set<string> {
  return new Set(
    name.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/)
      .filter((w) => w.length > 2 && !["the", "rugby", "rfc"].includes(w))
  );
}
function teamsMatch(a: string, b: string): boolean {
  const wa = nameWords(a), wb = nameWords(b);
  for (const w of wa) if (wb.has(w)) return true;
  return false;
}

function parseScore(s?: string): [number | null, number | null] {
  const m = s?.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  return m ? [Number(m[1]), Number(m[2])] : [null, null];
}

function mapStatus(description?: string): string | null {
  if (!description) return null;
  if (/finished|full.?time|ended/i.test(description)) return "FT";
  if (/not started|scheduled/i.test(description)) return null; // nothing to add pre-kickoff
  if (/half|progress|live|break/i.test(description)) return "Live";
  return description; // postponed/cancelled shown as-is
}

interface HLMatch {
  id: number;
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  state?: { description?: string; score?: string };
}

export async function refreshLiveScores(): Promise<void> {
  const key = process.env.HIGHLIGHTLY_API_KEY;
  if (!key) return;

  const today = new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query(
    `SELECT id, home_team, away_team, status FROM scores
     WHERE match_date = $1 AND status != ALL($2)`,
    [today, FINISHED]
  );
  if (rows.length === 0) return; // nothing on today — no API spend

  let matches: HLMatch[] = [];
  try {
    const res = await fetch(`https://rugby.highlightly.net/matches?date=${today}&limit=100`, {
      headers: { "x-rapidapi-key": key }, signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`-> ${res.status}`);
    matches = ((await res.json()) as { data?: HLMatch[] }).data ?? [];
  } catch (err) {
    console.error("[live] matches fetch failed:", err instanceof Error ? err.message : err);
    return;
  }

  let changed = 0;
  let live = 0;
  for (const row of rows) {
    const m = matches.find(
      (x) =>
        row.id === `hl-${x.id}` ||
        (teamsMatch(x.homeTeam?.name ?? "", row.home_team as string) &&
          teamsMatch(x.awayTeam?.name ?? "", row.away_team as string))
    );
    if (!m) continue;
    const [home, away] = parseScore(m.state?.score);
    const status = mapStatus(m.state?.description);
    if (status === "Live") live++;
    if (!status && home === null) continue; // still pre-kickoff
    const r = await pool.query(
      `UPDATE scores SET
         home_score = COALESCE($2, home_score),
         away_score = COALESCE($3, away_score),
         status = COALESCE($4, status)
       WHERE id = $1
         AND (($4 IS NOT NULL AND status IS DISTINCT FROM $4)
           OR ($2 IS NOT NULL AND (home_score IS DISTINCT FROM $2 OR away_score IS DISTINCT FROM $3)))`,
      [row.id, home, away, status]
    );
    changed += r.rowCount ?? 0;
  }

  if (changed > 0) {
    invalidatePrefix("fixtures:");
    console.log(`[live] updated ${changed} match(es), ${live} live`);
  }
}
