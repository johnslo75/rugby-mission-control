"use client";

import { useState } from "react";
import Header from "./components/Header";
import ChecklistPanel from "./components/ChecklistPanel";
import ContentPanel from "./components/ContentPanel";
import PerformancePanel from "./components/PerformancePanel";
import IntelligenceEngine from "./components/IntelligenceEngine";

interface PerfEntry {
  id: string;
  date: string;
  platform: string;
  hook: string;
  views: number;
  likes: number;
  followsGained: number;
  format: string;
  notes: string;
}

function getPostsThisWeek(entries: PerfEntry[]): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return entries.filter((e) => new Date(e.date) >= startOfWeek).length;
}

export default function Dashboard() {
  const [perfEntries, setPerfEntries] = useState<PerfEntry[]>([]);
  const [contentRefresh, setContentRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header postsThisWeek={getPostsThisWeek(perfEntries)} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <IntelligenceEngine onSaved={() => setContentRefresh((n) => n + 1)} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChecklistPanel />
          <ContentPanel refreshTrigger={contentRefresh} />
          <PerformancePanel onDataChange={setPerfEntries} />
        </div>
      </main>
    </div>
  );
}
