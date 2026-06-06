"use client";

import { useState } from "react";
import Header from "../components/Header";
import IntelligenceEngine from "../components/IntelligenceEngine";
import SitePostsPanel from "../components/SitePostsPanel";
import WeekendScoresPanel from "../components/WeekendScoresPanel";
import HotTakesPanel from "../components/HotTakesPanel";

type Tab = "dashboard" | "scores" | "site";

export default function HubDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header postsThisWeek={0} />

      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {([
              ["dashboard", "🧠 Intelligence"],
              ["scores",    "🏆 Fixtures & Scores"],
              ["site",      "🌐 Site Posts"],
            ] as const).map(([tab, label]) => (
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
          <IntelligenceEngine onSaved={() => {}} />
        )}
        {activeTab === "scores" && <WeekendScoresPanel />}
        {activeTab === "site" && (
          <>
            <SitePostsPanel />
            <HotTakesPanel />
          </>
        )}
      </main>
    </div>
  );
}
