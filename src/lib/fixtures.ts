import pool from "./db";
import { cachedMeta } from "./cache";
import type { Score } from "@/app/api/scores/route";

// Single owner of fixture reads from the scores table. The fixtures page,
// homepage scores widget and competition pages all query through here, so
// windowing, caching and error behaviour stay consistent.

export interface FixturesData {
  scores: Score[];
  updatedAt: number | null; // last successful fetch (ms epoch)
  stale: boolean;           // serving cached data past its TTL
  error: boolean;           // fetch failed and nothing was cached — scores is []
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function rowToScore(r: Record<string, unknown>): Score {
  return {
    id: r.id as string,
    competition: r.competition as string,
    homeTeam: r.home_team as string,
    awayTeam: r.away_team as string,
    homeScore: r.home_score as number | null,
    awayScore: r.away_score as number | null,
    matchDate: r.match_date as string,
    status: r.status as string,
    source: r.source as string,
    highlightUrl: (r.highlight_url as string) || null,
  };
}

async function queryScores(daysBack: number, daysForward: number, competitions?: string[]): Promise<Score[]> {
  const params: unknown[] = [isoDaysFromNow(-daysBack), isoDaysFromNow(daysForward)];
  let compFilter = "";
  if (competitions?.length) {
    compFilter = ` AND competition IN (${competitions.map((_, i) => `$${i + 3}`).join(", ")})`;
    params.push(...competitions);
  }
  const { rows } = await pool.query(
    `SELECT * FROM scores
     WHERE match_date >= $1 AND match_date <= $2${compFilter}
     ORDER BY match_date ASC, competition`,
    params
  );
  return rows.map(rowToScore);
}

export async function getFixtures(opts: {
  daysBack: number;
  daysForward: number;
  competitions?: string[];
  ttlSeconds?: number;
}): Promise<FixturesData> {
  const key = `fixtures:${opts.daysBack}:${opts.daysForward}:${opts.competitions?.join(",") || "all"}`;
  try {
    const { data, updatedAt, stale } = await cachedMeta(
      key,
      opts.ttlSeconds ?? 120,
      () => queryScores(opts.daysBack, opts.daysForward, opts.competitions)
    );
    return { scores: data, updatedAt, stale, error: false };
  } catch (err) {
    // cachedMeta only throws when the fetch failed AND there is no stale copy
    console.error(`[fixtures] query failed with no cached fallback (${key}):`, err instanceof Error ? err.message : err);
    return { scores: [], updatedAt: null, stale: false, error: true };
  }
}
