import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";
import { getTeamLogo } from "./team-logos";

// ─── Competition config ────────────────────────────────────────────────────────

const COMPETITION_CONFIG: Record<string, {
  // The World Rugby API ignores eventIds server-side — we filter client-side by competition label
  competitionLabels: string[];
  wikipediaUrl: string | null;
}> = {
  "six-nations": {
    competitionLabels: ["Six Nations"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Six_Nations_Championship",
  },
  "urc": {
    competitionLabels: ["United Rugby Championship"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_United_Rugby_Championship",
  },
  "champions-cup": {
    competitionLabels: ["Champions Cup", "European Rugby Champions Cup", "Investec Champions Cup"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_European_Rugby_Champions_Cup",
  },
  "challenge-cup": {
    competitionLabels: ["Challenge Cup", "European Rugby Challenge Cup", "EPCR Challenge Cup"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_European_Rugby_Challenge_Cup",
  },
  "premiership": {
    competitionLabels: ["Gallagher Premiership", "Premiership Rugby", "PREM Rugby"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025%E2%80%9326_Premiership_Rugby",
  },
  "top-14": {
    competitionLabels: ["Top 14"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_Top_14_season",
  },
  "super-rugby-pacific": {
    competitionLabels: ["Super Rugby"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Super_Rugby_Pacific_season",
  },
  "rugby-championship": {
    competitionLabels: ["Rugby Championship", "The Rugby Championship"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Rugby_Championship",
  },
  "world-cup-2027": {
    competitionLabels: [],
    wikipediaUrl: "https://en.wikipedia.org/wiki/2027_Rugby_World_Cup",
  },
  "emerging-nations": {
    competitionLabels: [],
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

// ─── Fetch fixtures from World Rugby API ───────────────────────────────────────
// Note: the API ignores eventIds server-side — we filter client-side by competition label

async function fetchFixtures(competitionLabels: string[]): Promise<Fixture[]> {
  if (!competitionLabels.length) return [];
  try {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 14);
    const future = new Date(today);
    future.setDate(today.getDate() + 21);

    const url = `https://api.wr-rims-prod.pulselive.com/rugby/v3/match?language=en&sort=asc&pageSize=200&sport=mru&startDate=${past.toISOString().slice(0, 10)}&endDate=${future.toISOString().slice(0, 10)}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json() as { content?: unknown[] };
    const matches = (data.content || []) as Record<string, unknown>[];

    const labelsLower = competitionLabels.map((l) => l.toLowerCase());

    return matches
      .filter((m) => {
        const teams = m.teams as { name: string }[] | undefined;
        if (!teams || teams.length < 2) return false;
        // Filter by competition label string (top-level field in API response)
        const compLabel = ((m.competition as string) || "").toLowerCase();
        return labelsLower.some((l) => compLabel.includes(l));
      })
      .map((m) => {
        const teams = m.teams as { name: string; score?: number }[];
        const scores = m.scores as number[] | undefined;
        const dateStr = ((m.time as Record<string, unknown>)?.label as string) || (m.date as string) || "";
        const venue = ((m.venue as Record<string, unknown>)?.name as string) || "";
        const statusRaw = (m.status as string) || "";
        const status: Fixture["status"] =
          statusRaw === "C" ? "completed" :
          statusRaw === "L" ? "live" : "scheduled";

        const homeTeam = teams[0]?.name || "TBC";
        const awayTeam = teams[1]?.name || "TBC";
        return {
          id: String(m.matchId || m.id || Math.random()),
          homeTeam,
          awayTeam,
          homeLogo: getTeamLogo(homeTeam),
          awayLogo: getTeamLogo(awayTeam),
          homeScore: status !== "scheduled" ? (scores?.[0] ?? 0) : null,
          awayScore: status !== "scheduled" ? (scores?.[1] ?? 0) : null,
          date: dateStr,
          venue,
          status,
        };
      });
  } catch (e) {
    console.error("Fixtures fetch error:", e);
    return [];
  }
}

// ─── Scrape standings from Wikipedia ──────────────────────────────────────────

async function scrapeStandings(wikiUrl: string): Promise<StandingRow[]> {
  try {
    const res = await fetch(wikiUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const rows: StandingRow[] = [];

    $("table.wikitable").each((_tableIdx, table) => {
      if (rows.length > 0) return false; // stop after first valid table

      const headers = $(table).find("th").map((_, th) => $(th).text().trim().toLowerCase()).get();
      const hasPts = headers.some((h) => h === "pts" || h === "points");
      const hasPld = headers.some((h) => h === "pld" || h === "p" || h === "gp");
      if (!hasPts || !hasPld) return;

      $(table).find("tr").each((_rowIdx, row) => {
        // Use td + th[scope=row] to capture team name in <th> cells
        const cells = $(row).find("td, th[scope='row']");
        if (cells.length < 6) return;

        const getNum = (i: number) => parseInt($(cells[i]).text().trim().replace(/[^\d+\-]/g, ""), 10) || 0;

        // Team name is always at index 1 as <th scope="row">
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
          bp: getNum(11) + getNum(12), // try bonus + losing bonus
          pts: getNum(13) || getNum(cells.length - 2),
        });
      });
    });

    return rows;
  } catch (e) {
    console.error("Standings scrape error:", e);
    return [];
  }
}

// ─── Cached exports ────────────────────────────────────────────────────────────

const getCachedFixtures = unstable_cache(
  fetchFixtures,
  ["wr-fixtures-v6"],
  { revalidate: 1800 }  // 30 minutes
);

const getCachedStandings = unstable_cache(
  scrapeStandings,
  ["wiki-standings-v6"],
  { revalidate: 3600 }  // 1 hour
);

export async function getCompetitionData(slug: string): Promise<{ fixtures: Fixture[]; standings: StandingRow[] }> {
  const config = COMPETITION_CONFIG[slug];
  if (!config) return { fixtures: [], standings: [] };

  const [fixtures, standings] = await Promise.all([
    config.competitionLabels.length ? getCachedFixtures(config.competitionLabels) : Promise.resolve([]),
    config.wikipediaUrl ? getCachedStandings(config.wikipediaUrl) : Promise.resolve([]),
  ]);

  return { fixtures, standings };
}
