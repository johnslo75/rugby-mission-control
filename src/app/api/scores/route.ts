import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { refreshScores } from "@/lib/scores-refresh";

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

// GET — scores from DB; ?refresh=1 (hub only) pulls from ESPN first
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get("refresh") === "1";
    const dateParam = searchParams.get("date");

    if (refresh) {
      // Refresh triggers 8 ESPN fetches + DB writes — hub users only.
      // The cron path calls refreshScores() directly, not this route.
      const denied = await requireAuth();
      if (denied) return denied;
      await refreshScores();
    }

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

    const scores: Score[] = dbScores.map((r) => ({
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

    return NextResponse.json(scores);

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
