"use client";

import { useState } from "react";
import Header from "../components/Header";
import ChecklistPanel from "../components/ChecklistPanel";
import ContentPanel from "../components/ContentPanel";
import PerformancePanel from "../components/PerformancePanel";
import IntelligenceEngine from "../components/IntelligenceEngine";
import SitePostsPanel from "../components/SitePostsPanel";
import BestIdeasPanel from "../components/BestIdeasPanel";

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

type Tab = "dashboard" | "best" | "site";

export default function HubDashboard() {
  const [perfEntries, setPerfEntries] = useState<PerfEntry[]>([]);
  const [contentRefresh, setContentRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header postsThisWeek={getPostsThisWeek(perfEntries)} />

      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {([["dashboard", "📊 Dashboard"], ["best", "⭐ Best Ideas"], ["site", "🌐 Site Posts"]] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#00C853] text-[#00C853]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <>
            <IntelligenceEngine onSaved={() => setContentRefresh((n) => n + 1)} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <ChecklistPanel />
              <ContentPanel refreshTrigger={contentRefresh} />
              <PerformancePanel onDataChange={setPerfEntries} />
            </div>
          </>
        )}
        {activeTab === "best" && <BestIdeasPanel />}
        {activeTab === "site" && <SitePostsPanel />}
      </main>
    </div>
  );
}
