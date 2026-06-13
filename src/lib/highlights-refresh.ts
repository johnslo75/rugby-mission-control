import pool from "./db";
import { invalidatePrefix } from "./cache";
import { sameTeam } from "./team-logos";

// Highlightly → DB highlights enrichment. ESPN (scores-refresh.ts) stays the
// owner of fixtures and scores; this only fills scores.highlight_url for
// finished matches. Runs hourly from instrumentation.ts. Budget: a handful of
// requests per run against a 7,500/day plan.

const BASE = "https://rugby.highlightly.net";
const LOOKBACK_DAYS = 7; // homepage shows results this far back

interface HLMatch {
  id: number;
  date: string;
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  league?: { name?: string };
}

function headers(): Record<string, string> | null {
  const key = process.env.HIGHLIGHTLY_API_KEY;
  return key ? { "x-rapidapi-key": key } : null;
}

async function api<T>(path: string, h: Record<string, string>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: h, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Highlightly ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

let columnEnsured = false;
async function ensureColumn() {
  if (columnEnsured) return;
  await pool.query("ALTER TABLE scores ADD COLUMN IF NOT EXISTS highlight_url TEXT");
  columnEnsured = true;
}

export async function refreshHighlights(): Promise<void> {
  const h = headers();
  if (!h) return; // not configured — feature simply stays off

  await ensureColumn();

  // Finished matches from the lookback window that still lack a highlight.
  // match_date is TEXT (ISO yyyy-mm-dd) — compare as strings like fixtures.ts.
  const isoDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };
  const { rows } = await pool.query(
    `SELECT id, home_team, away_team, match_date FROM scores
     WHERE highlight_url IS NULL
       AND home_score IS NOT NULL AND away_score IS NOT NULL
       AND match_date >= $1 AND match_date <= $2`,
    [isoDaysAgo(LOOKBACK_DAYS), isoDaysAgo(0)]
  );
  if (rows.length === 0) return;

  // One /matches call per distinct date covers every league
  const dates = [...new Set(rows.map((r) => String(r.match_date).slice(0, 10)))];
  const byDate = new Map<string, HLMatch[]>();
  for (const date of dates) {
    try {
      const body = await api<{ data?: HLMatch[] }>(`/matches?date=${date}&limit=100`, h);
      byDate.set(date, body.data ?? []);
    } catch (err) {
      console.error(`[highlights] matches fetch failed for ${date}:`, err instanceof Error ? err.message : err);
    }
  }

  let updated = 0;
  for (const row of rows) {
    const candidates = byDate.get(String(row.match_date).slice(0, 10)) ?? [];
    const match = candidates.find(
      (m) =>
        sameTeam(m.homeTeam?.name ?? "", row.home_team as string) &&
        sameTeam(m.awayTeam?.name ?? "", row.away_team as string)
    );
    if (!match) continue;
    try {
      const body = await api<{ data?: Array<{ url?: string; embedUrl?: string }> }>(
        `/highlights?matchId=${match.id}&limit=5`, h
      );
      const url = body.data?.find((c) => c.url || c.embedUrl);
      if (!url) continue; // no clip yet — retried next run
      await pool.query("UPDATE scores SET highlight_url=$2 WHERE id=$1", [row.id, url.url ?? url.embedUrl]);
      updated++;
    } catch (err) {
      console.error(`[highlights] clip fetch failed for ${row.home_team} v ${row.away_team}:`, err instanceof Error ? err.message : err);
    }
  }

  if (updated > 0) {
    invalidatePrefix("fixtures:");
    console.log(`[highlights] attached ${updated} highlight link(s) (${rows.length} candidates)`);
  }
}
