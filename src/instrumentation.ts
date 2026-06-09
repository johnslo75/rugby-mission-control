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

    const cron = await import("node-cron");

    cron.default.schedule("*/15 * * * *", () => runScoresRefresh("15min"));
    console.log("[Cron] Scores refresh scheduled every 15 minutes.");

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
