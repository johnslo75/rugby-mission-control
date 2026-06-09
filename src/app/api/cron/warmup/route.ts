import { NextRequest, NextResponse } from "next/server";
import { getAllStories, getWeekendScores, getAllFixtures } from "@/app/site/components/utils";
import { getCompetitionData } from "@/lib/competition-data";

const CRON_SECRET = process.env.CRON_SECRET;

// Pre-warm all in-memory caches after server restart
// Called by cron-job.org immediately after deploy or on a schedule
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const COMPETITION_SLUGS = [
    "urc", "premiership", "top-14", "super-rugby-pacific",
    "champions-cup", "six-nations", "rugby-championship",
  ];

  const results: Record<string, string> = {};

  // Warm stories, scores, fixtures in parallel
  const [stories, scores, fixtures] = await Promise.allSettled([
    getAllStories(),
    getWeekendScores(),
    getAllFixtures(),
  ]);
  results.stories = stories.status === "fulfilled" ? `${stories.value.length} stories` : "failed";
  results.scores = scores.status === "fulfilled" ? `${scores.value.length} scores` : "failed";
  results.fixtures = fixtures.status === "fulfilled" ? `${fixtures.value.length} fixtures` : "failed";

  // Warm competition pages (standings + fixtures) — one at a time to avoid hammering Wikipedia
  for (const slug of COMPETITION_SLUGS) {
    const result = await getCompetitionData(slug).catch(() => null);
    results[slug] = result
      ? `${result.fixtures.length} fixtures, ${result.standings.length} standings`
      : "failed";
  }

  return NextResponse.json({ ok: true, warmed: results, timestamp: new Date().toISOString() });
}
