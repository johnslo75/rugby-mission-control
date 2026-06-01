"use client";

import { useEffect, useState } from "react";
import type { Story } from "../api/stories/route";

const CATEGORY_COLORS: Record<string, string> = {
  Ireland: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "World Cup": "bg-blue-50 text-blue-700 border-blue-200",
  Shithousery: "bg-purple-50 text-purple-700 border-purple-200",
  "Hot Takes": "bg-red-50 text-red-700 border-red-200",
  Tactical: "bg-amber-50 text-amber-700 border-amber-200",
  Underdog: "bg-orange-50 text-orange-700 border-orange-200",
};

export default function SitePostsPanel() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories?all=1")
      .then((r) => r.json())
      .then((data) => { setStories(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function togglePublish(story: Story) {
    const updated = { ...story, published: !story.published };
    await fetch("/api/stories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setStories((prev) => prev.map((s) => (s.id === story.id ? updated : s)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this story from the site?")) return;
    await fetch(`/api/stories?id=${id}`, { method: "DELETE" });
    setStories((prev) => prev.filter((s) => s.id !== id));
  }

  async function toggleFeatured(story: Story) {
    const updated = { ...story, featured: !story.featured };
    await fetch("/api/stories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setStories((prev) => prev.map((s) => (s.id === story.id ? updated : s)));
  }

  const published = stories.filter((s) => s.published);
  const unpublished = stories.filter((s) => !s.published);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading stories…</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Published", value: published.length, color: "text-[#00C853]" },
          { label: "Drafts", value: unpublished.length, color: "text-amber-500" },
          { label: "Featured", value: stories.filter((s) => s.featured && s.published).length, color: "text-blue-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Story list */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">All Stories ({stories.length})</h3>
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || "https://rugbyradar.co"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#00C853] hover:underline"
          >
            View site →
          </a>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">📰</p>
            <p className="text-sm">No stories yet. Use &ldquo;Publish to Site&rdquo; in the Intelligence Engine.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stories.map((story) => (
              <div key={story.id} className={`px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors ${!story.published ? "opacity-60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">{story.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${CATEGORY_COLORS[story.category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {story.category}
                    </span>
                    {story.featured && (
                      <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 rounded px-1.5 py-0.5">⭐ Featured</span>
                    )}
                    {!story.published && (
                      <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded px-1.5 py-0.5">Draft</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">{story.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{story.excerpt}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleFeatured(story)}
                    title={story.featured ? "Unfeature" : "Feature"}
                    className={`text-xs px-2 py-1.5 rounded border transition-colors ${story.featured ? "bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100" : "bg-white border-gray-200 text-gray-400 hover:text-yellow-500"}`}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => togglePublish(story)}
                    className={`text-xs px-2.5 py-1.5 rounded border font-medium transition-colors ${story.published ? "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500" : "bg-emerald-50 border-emerald-200 text-[#00C853] hover:bg-emerald-100"}`}
                  >
                    {story.published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => remove(story.id)} className="text-xs px-2 py-1.5 rounded border border-gray-200 text-gray-300 hover:text-red-500 hover:border-red-200 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
