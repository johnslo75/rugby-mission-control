"use client";

import { useEffect, useState } from "react";
import type { Story } from "../api/stories/route";
import { COMPETITIONS, COMPETITIONS_BY_REGION, REGION_LABELS } from "@/lib/competitions";
import type { Region } from "@/lib/competitions";

const CATEGORY_COLORS: Record<string, string> = {
  Ireland: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "World Cup": "bg-blue-50 text-blue-700 border-blue-200",
  Shithousery: "bg-purple-50 text-purple-700 border-purple-200",
  "Hot Takes": "bg-red-50 text-red-700 border-red-200",
  Tactical: "bg-amber-50 text-amber-700 border-amber-200",
  Underdog: "bg-orange-50 text-orange-700 border-orange-200",
};

const REGION_ORDER: Region[] = ["northern", "southern", "global", "tier2"];

const BLANK_STORY: Story = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  category: "Six Nations",
  author: "Rugby Radar",
  date: new Date().toISOString().slice(0, 10),
  imageUrl: "",
  featured: false,
  published: true,
  tags: [],
};

function EditModal({ story, onSave, onClose, isNew }: {
  story: Story;
  onSave: (updated: Story) => void;
  onClose: () => void;
  isNew?: boolean;
}) {
  const [draft, setDraft] = useState({ ...story });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "Upload failed");
      setDraft({ ...draft, imageUrl: data.url } as Story & { imageUrl?: string });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const created = await res.json() as Story;
        onSave(created);
      } else {
        const res = await fetch("/api/stories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        onSave(draft);
      }
    } catch (err) {
      alert(`⚠️ Save failed: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isNew ? "New Story" : "Edit Story"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="field-label">Title</label>
            <input
              className="field-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="field-label">Excerpt</label>
            <textarea
              className="field-input"
              rows={2}
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
            />
          </div>

          {/* Category + Author row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Category</label>
              <select
                className="field-input"
                value={draft.category}
                onChange={(e) => {
                  const comp = COMPETITIONS.find((c) => c.name === e.target.value);
                  setDraft({ ...draft, category: e.target.value, competitions: comp ? [comp.slug] : [] });
                }}
              >
                <optgroup label="General">
                  <option value="News">📰 News</option>
                  <option value="Analysis">📐 Analysis</option>
                  <option value="Match Previews">🎥 Maeve on Matchday</option>
                </optgroup>
                {REGION_ORDER.map((region) => (
                  <optgroup key={region} label={REGION_LABELS[region]}>
                    {COMPETITIONS_BY_REGION[region].map((comp) => (
                      <option key={comp.slug} value={comp.name}>{comp.emoji} {comp.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Author</label>
              <input
                className="field-input"
                value={draft.author}
                onChange={(e) => setDraft({ ...draft, author: e.target.value })}
              />
            </div>
          </div>

          {/* Slug + Evergreen picker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Slug <span className="text-gray-400 font-normal">(leave blank to auto-generate)</span></label>
              <input
                className="field-input font-mono text-sm"
                placeholder="e.g. urc-format-explained"
                value={draft.slug || ""}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              />
            </div>
            <div>
              <label className="field-label">Evergreen topic <span className="text-gray-400 font-normal">(auto-fills slug)</span></label>
              <select
                className="field-input"
                value=""
                onChange={(e) => { if (e.target.value) setDraft({ ...draft, slug: e.target.value }); }}
              >
                <option value="">— pick a topic —</option>
                {COMPETITIONS.filter((comp) => comp.hasFixtures).map((comp) => (
                  <optgroup key={comp.slug} label={comp.name}>
                    {comp.evergreen.map((topic) => (
                      <option key={topic} value={topic}>{topic.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* YouTube video (Maeve on Matchday and any video story) */}
          <div>
            <label className="field-label">YouTube video URL</label>
            <input
              className="field-input"
              value={draft.videoUrl || ""}
              onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=… (featured on Maeve on Matchday)"
            />
          </div>

          {/* Image */}
          <div>
            <label className="field-label">Image</label>
            <div className="flex gap-2 items-center mb-2">
              <input
                className="field-input"
                value={(draft as Story & { imageUrl?: string }).imageUrl || ""}
                onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value } as Story & { imageUrl?: string })}
                placeholder="Paste image URL or upload below…"
              />
            </div>
            <label className={`inline-flex items-center gap-2 cursor-pointer text-xs px-3 py-1.5 rounded border font-medium transition-colors ${uploading ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400" : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"}`}>
              {uploading ? "⏳ Uploading…" : "📁 Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
            {(draft as Story & { imageUrl?: string }).imageUrl && (
              <img
                src={(draft as Story & { imageUrl?: string }).imageUrl}
                alt="preview"
                className="mt-2 rounded-lg w-full object-cover"
                style={{ maxHeight: 200 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>

          {/* Body */}
          <div>
            <label className="field-label">Body (HTML)</label>
            <textarea
              className="field-input font-mono text-xs"
              rows={10}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={!!draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={!!draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
              Featured
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary text-sm">
            {saving ? "Saving…" : isNew ? "Publish story" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SitePostsPanel() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Story | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    fetch("/api/stories?all=1")
      .then((r) => r.json())
      .then((data) => { setStories(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function togglePublish(story: Story) {
    const updated = { ...story, published: !story.published };
    const res = await fetch("/api/stories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) {
      alert(`Failed to update story (${res.status}) — change not saved.`);
      return;
    }
    setStories((prev) => prev.map((s) => (s.id === story.id ? updated : s)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this story from the site?")) return;
    const res = await fetch(`/api/stories?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(`Failed to delete story (${res.status}).`);
      return;
    }
    setStories((prev) => prev.filter((s) => s.id !== id));
  }

  async function toggleFeatured(story: Story) {
    const updated = { ...story, featured: !story.featured };
    const res = await fetch("/api/stories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (!res.ok) {
      alert(`Failed to update featured story (${res.status}) — change not saved.`);
      return;
    }
    // Server keeps a single featured story — mirror that locally
    setStories((prev) =>
      prev.map((s) =>
        s.id === story.id
          ? updated
          : updated.featured && s.featured
            ? { ...s, featured: false }
            : s
      )
    );
  }

  function handleSave(updated: Story) {
    setStories((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditing(null);
  }

  function handleCreate(created: Story) {
    setStories((prev) => [created, ...prev]);
    setCreatingNew(false);
  }

  const published = stories.filter((s) => s.published);
  const unpublished = stories.filter((s) => !s.published);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading stories…</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Published", value: published.length, color: "text-[#00a86b]" },
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreatingNew(true)}
              className="btn-primary text-xs py-1.5 px-3"
            >
              ✏️ New Story
            </button>
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL || "https://rugbyradar.co"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#00a86b] hover:underline"
            >
              View site →
            </a>
          </div>
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
                    onClick={() => setEditing(story)}
                    className="text-xs px-2.5 py-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => togglePublish(story)}
                    className={`text-xs px-2.5 py-1.5 rounded border font-medium transition-colors ${story.published ? "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500" : "bg-emerald-50 border-emerald-200 text-[#00a86b] hover:bg-emerald-100"}`}
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

      {/* Edit modal */}
      {editing && (
        <EditModal
          story={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {/* New story modal */}
      {creatingNew && (
        <EditModal
          story={{ ...BLANK_STORY, date: new Date().toISOString().slice(0, 10) }}
          onSave={handleCreate}
          onClose={() => setCreatingNew(false)}
          isNew
        />
      )}
    </div>
  );
}
