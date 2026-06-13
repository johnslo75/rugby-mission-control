"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// When a match is in play, re-fetch the server component every 30s so an
// already-open page shows the ticking score without a manual reload.
// router.refresh() re-renders the (force-dynamic) page from the freshly
// invalidated cache and reconciles in place — scroll position is kept.
// Renders nothing; only mounted by pages when `active` is true, so quiet
// days do no polling at all.
export default function LiveRefresher({ active, intervalMs = 30000 }: { active: boolean; intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      // Pause when the tab is hidden — no point refreshing a backgrounded page
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs, router]);
  return null;
}
