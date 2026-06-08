import { NextRequest, NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;

// Called on a schedule to auto-refresh scores from ESPN
// Secure with a secret token so it can't be triggered by anyone
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://hub.rugbyradar.co";
  const res = await fetch(`${baseUrl}/api/scores?refresh=1`, {
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(25000), // 25s — cron-job.org times out at 30s
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: `ESPN fetch failed: ${res.status} ${text.slice(0, 200)}` }, { status: 500 });
  }

  const scores = await res.json() as unknown[];
  return NextResponse.json({ ok: true, updated: scores.length, timestamp: new Date().toISOString() });
}
