import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getLastScoresRefresh } from "@/lib/scores-refresh";

export const dynamic = "force-dynamic";

// Health check for Railway (and humans). 200 when the DB answers,
// 503 when it doesn't. Includes the last scores refresh so a stalled
// fixtures pipeline is visible at a glance.
export async function GET() {
  const startedAt = Date.now();
  try {
    await pool.query("SELECT 1");
    const lastRefresh = await getLastScoresRefresh();
    return NextResponse.json({
      ok: true,
      db: true,
      dbLatencyMs: Date.now() - startedAt,
      lastScoresRefresh: lastRefresh?.at ?? null,
      uptimeSeconds: Math.round(process.uptime()),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        db: false,
        error: err instanceof Error ? err.message : String(err),
        uptimeSeconds: Math.round(process.uptime()),
      },
      { status: 503 }
    );
  }
}
