import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export interface Score {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  status: string;
  source: string;
}

// ESPN league IDs → competition names
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

async function fetchESPN(leagueId: number, leagueName: string, dateFrom: Date, dateTo: Date): Promise<Score[]> {
  try {
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
    const dateRange = `${fmt(dateFrom)}-${fmt(dateTo)}`;
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/rugby/${leagueId}/scoreboard?dates=${dateRange}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const data = await res.json() as {
      events: Array<{
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
      }>;
    };

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
  } catch {
    return [];
  }
}

// GET — fetch from ESPN + manual entries from DB
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get("refresh") === "1";
    const dateParam = searchParams.get("date");

    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - 3);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(now);
    windowEnd.setDate(now.getDate() + 7);
    windowEnd.setHours(23, 59, 59, 999);

    const weekStart = dateParam ? new Date(dateParam + "T00:00:00Z") : windowStart;
    const weekEnd = dateParam
      ? new Date(new Date(dateParam).getTime() + 10 * 86400000)
      : windowEnd;

    // Fetch DB scores for this window
    const { rows: dbScores } = await pool.query(
      `SELECT * FROM scores WHERE match_date >= $1 AND match_date <= $2 ORDER BY competition, match_date`,
      [weekStart.toISOString().slice(0, 10), weekEnd.toISOString().slice(0, 10)]
    );

    const manual: Score[] = dbScores.map((r) => ({
      id: r.id,
      competition: r.competition,
      homeTeam: r.home_team,
      awayTeam: r.away_team,
      homeScore: r.home_score,
      awayScore: r.away_score,
      matchDate: r.match_date,
      status: r.status,
      source: r.source,
    }));

    if (!refresh) {
      return NextResponse.json(manual);
    }

    // Fetch live from ESPN in parallel
    const espnResults = await Promise.all(
      LEAGUES.map((l) => fetchESPN(l.id, l.name, weekStart, weekEnd))
    );
    const espnFlat = espnResults.flat().filter((s) => {
      const d = new Date(s.matchDate);
      return d >= weekStart && d <= weekEnd;
    });

    // Upsert ESPN scores into DB (parallel, ignore individual failures)
    await Promise.allSettled(espnFlat.map((s) => pool.query(`
      INSERT INTO scores (id, competition, home_team, away_team, home_score, away_score, match_date, status, source)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (id) DO UPDATE SET
        home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score,
        status=EXCLUDED.status
    `, [s.id, s.competition, s.homeTeam, s.awayTeam, s.homeScore, s.awayScore,
        s.matchDate.slice(0, 10), s.status, s.source])));

    // Return combined (ESPN + manual), deduped by ID
    const allById = new Map<string, Score>();
    for (const s of [...espnFlat, ...manual]) allById.set(s.id, s);
    return NextResponse.json(Array.from(allById.values()));

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Scores GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — add a manual score
export async function POST(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const body = await req.json() as Omit<Score, "id" | "source">;
  const id = `manual-${Date.now()}`;
  await pool.query(`
    INSERT INTO scores (id, competition, home_team, away_team, home_score, away_score, match_date, status, source)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'manual')
  `, [id, body.competition, body.homeTeam, body.awayTeam,
      body.homeScore ?? null, body.awayScore ?? null,
      body.matchDate, body.status || "FT"]);
  return NextResponse.json({ ...body, id, source: "manual" });
}

// DELETE — remove a manual score
export async function DELETE(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await pool.query("DELETE FROM scores WHERE id=$1 AND source='manual'", [id]);
  return NextResponse.json({ ok: true });
}
