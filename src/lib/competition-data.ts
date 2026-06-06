import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";
import { getTeamLogo } from "./team-logos";

// ─── Competition config ────────────────────────────────────────────────────────

const COMPETITION_CONFIG: Record<string, {
  worldRugbyEventId: string | null;
  wikipediaUrl: string | null;
}> = {
  "six-nations": {
    worldRugbyEventId: "b6832e99-0c73-4d56-ba57-725935c2f1dd",
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Six_Nations_Championship",
  },
  "urc": {
    worldRugbyEventId: "3c5cab4f-1933-4181-8907-4bed6d2fd9c6",
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_United_Rugby_Championship",
  },
  "champions-cup": {
    worldRugbyEventId: "770bfb2a-2947-45fc-b54c-9afd2f14a9f5",
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_European_Rugby_Champions_Cup",
  },
  "challenge-cup": {
    worldRugbyEventId: "acd1f126-cea9-4723-9343-e3b4e8d806f4",
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_European_Rugby_Challenge_Cup",
  },
  "premiership": {
    worldRugbyEventId: "65f66693-9ccb-4784-bc3c-7b5b3cabecc3",
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_Premiership_Rugby_season",
  },
  "top-14": {
    worldRugbyEventId: "d72547e0-d76e-4612-9f1c-a3f60d320074",
    wikipediaUrl: "https://en.wikipedia.org/wiki/2025-26_Top_14_season",
  },
  "super-rugby-pacific": {
    worldRugbyEventId: "af9ef6cd-4a14-469d-83da-dd85b9882636",
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Super_Rugby_Pacific_season",
  },
  "rugby-championship": {
    worldRugbyEventId: "e08b6337-4316-4d64-811c-d5fdb3826c06",
    wikipediaUrl: "https://en.wikipedia.org/wiki/2026_Rugby_Championship",
  },
  "world-cup-2027": {
    worldRugbyEventId: null,
    wikipediaUrl: "https://en.wikipedia.org/wiki/2027_Rugby_World_Cup",
  },
  "emerging-nations": {
    worldRugbyEventId: null,
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

async function fetchFixtures(eventId: string): Promise<Fixture[]> {
  try {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 30);
    const future = new Date(today);
    future.setDate(today.getDate() + 60);

    const url = `https://api.wr-rims-prod.pulselive.com/rugby/v3/match?language=en&sort=asc&pageSize=50&sport=mru&startDate=${past.toISOString().slice(0, 10)}&endDate=${future.toISOString().slice(0, 10)}&eventIds=${eventId}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json() as { content?: unknown[] };
    const matches = (data.content || []) as Record<string, unknown>[];

    return matches
      .filter((m) => {
        const teams = m.teams as { name: string }[] | undefined;
        if (!teams || teams.length < 2) return false;
        // Filter strictly by event ID to avoid mixing competitions
        const events = m.events as { id?: string; altId?: string }[] | undefined;
        const matchEventId = events?.[0]?.id || events?.[0]?.altId;
        return matchEventId === eventId;
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
  ["wr-fixtures-v2"],
  { revalidate: 10800 }
);

const getCachedStandings = unstable_cache(
  scrapeStandings,
  ["wiki-standings-v4"],
  { revalidate: 10800 }
);

export async function getCompetitionData(slug: string): Promise<{ fixtures: Fixture[]; standings: StandingRow[] }> {
  const config = COMPETITION_CONFIG[slug];
  if (!config) return { fixtures: [], standings: [] };

  const [fixtures, standings] = await Promise.all([
    config.worldRugbyEventId ? getCachedFixtures(config.worldRugbyEventId) : Promise.resolve([]),
    config.wikipediaUrl ? getCachedStandings(config.wikipediaUrl) : Promise.resolve([]),
  ]);

  return { fixtures, standings };
}
