import * as cheerio from "cheerio";
import { getTeamLogo } from "./team-logos";
import pool from "./db";
import { cached } from "./cache";

// ─── Competition config ────────────────────────────────────────────────────────

// dbCompetitionNames must match the ESPN values stored in the scores table
const COMPETITION_CONFIG: Record<string, {
  dbCompetitionNames: string[];
  wikipediaUrl: string | null;
}> = {
  "six-nations": {
    dbCompetitionNames: ["Six Nations"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Six_Nations_Championship",
  },
  "urc": {
    dbCompetitionNames: ["United Rugby Championship"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025%E2%80%9326_United_Rugby_Championship",
  },
  "champions-cup": {
    dbCompetitionNames: ["European Champions Cup"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025%E2%80%9326_European_Rugby_Champions_Cup",
  },
  "challenge-cup": {
    dbCompetitionNames: [],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025%E2%80%9326_European_Rugby_Challenge_Cup",
  },
  "premiership": {
    dbCompetitionNames: ["Gallagher Premiership"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025%E2%80%9326_Premiership_Rugby",
  },
  "top-14": {
    dbCompetitionNames: ["French Top 14"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025%E2%80%9326_Top_14_season",
  },
  "super-rugby-pacific": {
    dbCompetitionNames: ["Super Rugby Pacific"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Super_Rugby_Pacific_season",
  },
  "rugby-championship": {
    dbCompetitionNames: ["Rugby Championship", "International Test Match"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Rugby_Championship",
  },
  "world-cup-2027": {
    dbCompetitionNames: [],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2027_Rugby_World_Cup",
  },
  "emerging-nations": {
    dbCompetitionNames: [],
    wikipediaUrl: null,
  },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  venue: string;
  status: "scheduled" | "live" | "completed";
}

export interface StandingRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pf: number;
  pa: number;
  pd: number;
  bp: number;
  pts: number;
}

// ─── Fixtures: direct DB query, no cache layer ────────────────────────────────
// Wide window so results survive if cron misses a run or two

async function fetchFixtures(dbCompetitionNames: string[]): Promise<Fixture[]> {
  if (!dbCompetitionNames.length) return [];

  const today = new Date();
  const past = new Date(today);
  past.setDate(today.getDate() - 30);   // 30 days back
  const future = new Date(today);
  future.setDate(today.getDate() + 30); // 30 days forward

  const placeholders = dbCompetitionNames.map((_, i) => `$${i + 3}`).join(", ");
  const { rows } = await pool.query(
    `SELECT * FROM scores
     WHERE match_date >= $1
       AND match_date <= $2
       AND competition IN (${placeholders})
     ORDER BY match_date ASC`,
    [past.toISOString().slice(0, 10), future.toISOString().slice(0, 10), ...dbCompetitionNames]
  );

  return rows.map((r) => {
    const isCompleted = r.home_score !== null && r.away_score !== null;
    const isLive = r.status === "Live" || r.status === "live";
    return {
      id: r.id,
      homeTeam: r.home_team,
      awayTeam: r.away_team,
      homeLogo: getTeamLogo(r.home_team),
      awayLogo: getTeamLogo(r.away_team),
      homeScore: isCompleted ? r.home_score : null,
      awayScore: isCompleted ? r.away_score : null,
      date: r.match_date,
      venue: "",
      status: isLive ? "live" : isCompleted ? "completed" : "scheduled",
    };
  });
}

// ─── Standings: in-memory cache (1 hour TTL, returns stale on error) ──────────

async function scrapeStandings(wikiUrl: string): Promise<StandingRow[]> {
  const res = await fetch(wikiUrl, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Wikipedia returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const rows: StandingRow[] = [];

  $("table.wikitable").each((_tableIdx, table) => {
    if (rows.length > 0) return false;

    const headers = $(table).find("th").map((_, th) => $(th).text().trim().toLowerCase()).get();
    const hasPts = headers.some((h) => h === "pts" || h === "points");
    const hasPld = headers.some((h) => h === "pld" || h === "p" || h === "gp");
    if (!hasPts || !hasPld) return;

    $(table).find("tr").each((_rowIdx, row) => {
      const cells = $(row).find("td, th[scope='row']");
      if (cells.length < 6) return;

      const getNum = (i: number) => parseInt($(cells[i]).text().trim().replace(/[^\d+\-]/g, ""), 10) || 0;
      const teamName = $(cells[1]).find("a").first().text().trim() || $(cells[1]).text().trim();
      if (!teamName || teamName.length < 2 || /^\d+$/.test(teamName)) return;

      rows.push({
        position: getNum(0) || rows.length + 1,
        team: teamName,
        played: getNum(2),
        won: getNum(3),
        drawn: getNum(4),
        lost: getNum(5),
        pf: getNum(6),
        pa: getNum(7),
        pd: getNum(8),
        bp: getNum(11) + getNum(12),
        pts: getNum(13) || getNum(cells.length - 2),
      });
    });
  });

  return rows;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function getCompetitionData(slug: string): Promise<{ fixtures: Fixture[]; standings: StandingRow[] }> {
  const config = COMPETITION_CONFIG[slug];
  if (!config) return { fixtures: [], standings: [] };

  const [fixtures, standings] = await Promise.all([
    // Fixtures: direct DB query every time — fast, no stale cache risk
    config.dbCompetitionNames.length
      ? fetchFixtures(config.dbCompetitionNames).catch(() => [])
      : Promise.resolve([] as Fixture[]),

    // Standings: in-memory cache, 1 hour TTL, returns stale on Wikipedia error
    config.wikipediaUrl
      ? cached(`standings-${slug}`, 3600, () => scrapeStandings(config.wikipediaUrl!)).catch(() => [])
      : Promise.resolve([] as StandingRow[]),
  ]);

  return { fixtures, standings };
}
