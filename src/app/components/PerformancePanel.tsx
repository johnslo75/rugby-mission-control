"use client";

import { useEffect, useState } from "react";

type Platform = "TikTok" | "Instagram Reels" | "YouTube Shorts";
type Format = "voiceover" | "text overlay" | "reaction";

interface PerfEntry {
  id: string;
  date: string;
  platform: Platform;
  hook: string;
  views: number;
  likes: number;
  followsGained: number;
  format: Format;
  notes: string;
}

const PLATFORM_ICONS: Record<Platform, string> = {
  TikTok: "🎵",
  "Instagram Reels": "📸",
  "YouTube Shorts": "▶️",
};

const EMPTY: Omit<PerfEntry, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  platform: "TikTok",
  hook: "",
  views: 0,
  likes: 0,
  followsGained: 0,
  format: "voiceover",
  notes: "",
};

export default function PerformancePanel({ onDataChange }: { onDataChange?: (entries: PerfEntry[]) => void }) {
  const [entries, setEntries] = useState<PerfEntry[]>([]);
  const [form, setForm] = useState<Omit<PerfEntry, "id">>({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/performance")
      .then((r) => r.json())
      .then((data) => { setEntries(data); onDataChange?.(data); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editId) {
      const res = await fetch("/api/performance", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editId }) });
      const updated = await res.json();
      const next = entries.map((e) => (e.id === editId ? updated : e));
      setEntries(next); onDataChange?.(next);
    } else {
      const res = await fetch("/api/performance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const created = await res.json();
      const next = [created, ...entries];
      setEntries(next); onDataChange?.(next);
    }
    setForm({ ...EMPTY }); setShowForm(false); setEditId(null); setSaving(false);
  }

  async function remove(id: string) {
    await fetch(`/api/performance?id=${id}`, { method: "DELETE" });
    const next = entries.filter((e) => e.id !== id);
    setEntries(next); onDataChange?.(next);
  }

  function startEdit(entry: PerfEntry) {
    const { id, ...rest } = entry;
    setForm(rest); setEditId(id); setShowForm(true);
  }

  const totalViews = entries.reduce((s, e) => s + Number(e.views), 0);
  const totalFollows = entries.reduce((s, e) => s + Number(e.followsGained), 0);
  const avgFollows = entries.length ? (totalFollows / entries.length).toFixed(1) : "0";
  const best = entries.length ? entries.reduce((a, b) => (Number(a.views) > Number(b.views) ? a : b)) : null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Performance Tracker</h2>
        <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setShowForm((v) => !v); }} className="btn-primary text-sm">
          {showForm && !editId ? "Cancel" : "+ Log Post"}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatCard label="Total Views" value={totalViews.toLocaleString()} />
          <StatCard label="Avg Follows" value={avgFollows} />
          <StatCard label="Posts" value={String(entries.length)} />
        </div>
      )}

      {best && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-xs text-[#00C853] font-semibold uppercase tracking-wide mb-1">🏆 Best Performing Hook</p>
          <p className="text-sm text-gray-800 italic">&ldquo;{best.hook}&rdquo;</p>
          <p className="text-xs text-gray-400 mt-1">{best.views.toLocaleString()} views · {PLATFORM_ICONS[best.platform]} {best.platform}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="mb-5 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{editId ? "Edit Post" : "Log New Post"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="field-label">Date Posted</label><input type="date" className="field-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
            <div><label className="field-label">Platform</label>
              <select className="field-input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}>
                <option>TikTok</option><option>Instagram Reels</option><option>YouTube Shorts</option>
              </select>
            </div>
          </div>
          <div><label className="field-label">Hook Text</label><textarea className="field-input" rows={2} placeholder="Opening hook used…" value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} required /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="field-label">Views</label><input type="number" className="field-input" min={0} value={form.views} onChange={(e) => setForm({ ...form, views: Number(e.target.value) })} /></div>
            <div><label className="field-label">Likes</label><input type="number" className="field-input" min={0} value={form.likes} onChange={(e) => setForm({ ...form, likes: Number(e.target.value) })} /></div>
            <div><label className="field-label">Follows</label><input type="number" className="field-input" min={0} value={form.followsGained} onChange={(e) => setForm({ ...form, followsGained: Number(e.target.value) })} /></div>
          </div>
          <div><label className="field-label">Format</label>
            <select className="field-input" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as Format })}>
              <option value="voiceover">Voiceover</option><option value="text overlay">Text Overlay</option><option value="reaction">Reaction</option>
            </select>
          </div>
          <div><label className="field-label">Notes</label><textarea className="field-input" rows={2} placeholder="What worked, what didn't…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : editId ? "Update" : "Log Post"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {entries.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No posts logged yet.</p>}
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs text-gray-400">{entry.date}</span>
                  <span className="text-xs font-medium text-gray-500">{PLATFORM_ICONS[entry.platform]} {entry.platform}</span>
                  <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 capitalize">{entry.format}</span>
                </div>
                <p className="text-sm text-gray-800 italic mb-2 truncate">&ldquo;{entry.hook}&rdquo;</p>
                <div className="flex gap-3 text-xs">
                  <Metric label="Views" value={Number(entry.views).toLocaleString()} />
                  <Metric label="Likes" value={Number(entry.likes).toLocaleString()} />
                  <Metric label="Follows" value={`+${Number(entry.followsGained).toLocaleString()}`} highlight />
                </div>
                {entry.notes && <p className="text-xs text-gray-400 mt-1.5">{entry.notes}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(entry)} className="text-gray-300 hover:text-gray-600 transition-colors text-xs p-1">✏️</button>
                <button onClick={() => remove(entry.id)} className="text-gray-300 hover:text-red-500 transition-colors text-xs p-1">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-[#00C853]">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-semibold ${highlight ? "text-[#00C853]" : "text-gray-700"}`}>{value}</span>
    </span>
  );
}
