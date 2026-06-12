export async function register() {
  // Only run in Node.js server environment (not edge, not client)
  if (process.env.NEXT_RUNTIME === "nodejs") {

    // Pre-warm the story cache so the first page request is instant
    setTimeout(async () => {
      try {
        const { getAllStories } = await import("./app/site/components/utils");
        await getAllStories();
        console.log("[Cache] Story cache warmed on startup.");
      } catch (err) {
        console.error("[Cache] Warmup failed:", err);
      }
    }, 2000);

    // Refresh scores shortly after startup so a deploy never serves stale
    // fixtures, then every 15 minutes. This runs in-process — the external
    // cron-job.org trigger on /api/cron/scores is redundancy, not the owner.
    const runScoresRefresh = async (label: string) => {
      try {
        const { refreshScores } = await import("./lib/scores-refresh");
        await refreshScores();
      } catch (err) {
        console.error(`[Cron] Scores refresh (${label}) failed:`, err);
      }
    };
    setTimeout(() => runScoresRefresh("startup"), 5000);

    // Attach Highlightly highlight links to recently finished matches.
    // No-op when HIGHLIGHTLY_API_KEY isn't set.
    const runHighlightsRefresh = async (label: string) => {
      try {
        const { refreshHighlights } = await import("./lib/highlights-refresh");
        await refreshHighlights();
      } catch (err) {
        console.error(`[Cron] Highlights refresh (${label}) failed:`, err);
      }
    };
    setTimeout(() => runHighlightsRefresh("startup"), 15000);

    // Women's fixtures/results come from Highlightly (ESPN doesn't carry them).
    const runWomensRefresh = async (label: string) => {
      try {
        const { refreshWomensScores } = await import("./lib/womens-refresh");
        await refreshWomensScores();
      } catch (err) {
        console.error(`[Cron] Womens refresh (${label}) failed:`, err);
      }
    };
    setTimeout(() => runWomensRefresh("startup"), 10000);

    const cron = await import("node-cron");

    cron.default.schedule("*/15 * * * *", () => runScoresRefresh("15min"));
    console.log("[Cron] Scores refresh scheduled every 15 minutes.");

    cron.default.schedule("30 * * * *", () => runHighlightsRefresh("hourly"));
    console.log("[Cron] Highlights refresh scheduled hourly.");

    cron.default.schedule("20 * * * *", () => runWomensRefresh("hourly"));
    console.log("[Cron] Womens scores refresh scheduled hourly.");

    // Live scores: every 2 minutes, but it exits without an API call
    // unless today has an unfinished match
    cron.default.schedule("*/2 * * * *", async () => {
      try {
        const { refreshLiveScores } = await import("./lib/live-refresh");
        await refreshLiveScores();
      } catch (err) {
        console.error("[Cron] Live refresh failed:", err);
      }
    });
    console.log("[Cron] Live scores watcher scheduled every 2 minutes.");

    // Schedule daily scan at 7:00 AM UTC
    cron.default.schedule("0 7 * * *", async () => {
      console.log("[Cron] Starting scheduled 7am rugby scan…");
      try {
        const { runScanPipeline } = await import("./app/api/scan/route");
        const result = await runScanPipeline();
        console.log(`[Cron] Scan complete. ${result.stories.length} stories generated.`);
      } catch (err) {
        console.error("[Cron] Scan failed:", err);
      }
    });

    console.log("[Cron] Daily 7am scan scheduled.");
  }
}
