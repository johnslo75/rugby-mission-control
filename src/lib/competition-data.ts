import * as cheerio from "cheerio";
import { getTeamLogo } from "./team-logos";
import { cached } from "./cache";
import { getFixtures } from "./fixtures";

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

// ─── Fixtures: shared query module (src/lib/fixtures.ts) ──────────────────────
// Wide window so results survive if cron misses a run or two

async function fetchFixtures(dbCompetitionNames: string[]): Promise<Fixture[]> {
  if (!dbCompetitionNames.length) return [];

  const { scores } = await getFixtures({
    daysBack: 30,
    daysForward: 30,
    competitions: dbCompetitionNames,
    ttlSeconds: 120,
  });

  return scores.map((s) => {
    const isCompleted = s.homeScore !== null && s.awayScore !== null;
    const isLive = s.status === "Live" || s.status === "live";
    return {
      id: s.id,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      homeLogo: getTeamLogo(s.homeTeam),
      awayLogo: getTeamLogo(s.awayTeam),
      homeScore: isCompleted ? s.homeScore : null,
      awayScore: isCompleted ? s.awayScore : null,
      date: s.matchDate,
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
    signal: AbortSignal.timeout(3000),
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
