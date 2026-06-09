import { NextRequest, NextResponse } from "next/server";
import { refreshScores } from "@/lib/scores-refresh";

const CRON_SECRET = process.env.CRON_SECRET;

// External trigger (cron-job.org) for the scores refresh — kept as
// redundancy alongside the in-process 15-minute cron in instrumentation.ts.
// Calls the refresh function directly instead of HTTP-fetching our own
// public URL, which added DNS/proxy/timeout failure modes.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[cron] /api/cron/scores triggered");
  try {
    const summary = await refreshScores();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron] scores refresh failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
