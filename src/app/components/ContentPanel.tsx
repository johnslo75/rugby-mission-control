"use client";

import { useEffect, useState } from "react";

type Status = "idea" | "in production" | "posted";

interface ContentEntry {
  id: string;
  date: string;
  match: string;
  angle: string;
  hook: string;
  status: Status;
  notes: string;
}

const STATUS_COLORS: Record<Status, string> = {
  idea: "bg-blue-50 text-blue-600 border-blue-200",
  "in production": "bg-amber-50 text-amber-600 border-amber-200",
  posted: "bg-emerald-50 text-[#00C853] border-emerald-200",
};

const EMPTY: Omit<ContentEntry, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  match: "",
  angle: "",
  hook: "",
  status: "idea",
  notes: "",
};

export default function ContentPanel({ refreshTrigger }: { refreshTrigger?: number }) {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then(setEntries);
  }, [refreshTrigger]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editId) {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editId }),
      });
      const updated = await res.json();
      setEntries((prev) => prev.map((e) => (e.id === editId ? updated : e)));
    } else {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setEntries((prev) => [created, ...prev]);
    }
    setForm({ ...EMPTY });
    setShowForm(false);
    setEditId(null);
    setSaving(false);
  }

  async function remove(id: string) {
    await fetch(`/api/content?id=${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function startEdit(entry: ContentEntry) {
    const { id, ...rest } = entry;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  }

  async function cycleStatus(entry: ContentEntry) {
    const cycle: Status[] = ["idea", "in production", "posted"];
    const next = cycle[(cycle.indexOf(entry.status) + 1) % cycle.length];
    const updated = { ...entry, status: next };
    await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)));
  }

  const filtered = entries.filter((e) => {
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || [e.match, e.angle, e.hook, e.notes].some((f) => f.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Content Ideas Log</h2>
        <button
          onClick={() => { setForm({ ...EMPTY }); setEditId(null); setShowForm((v) => !v); }}
          className="btn-primary text-sm"
        >
          {showForm && !editId ? "Cancel" : "+ New Idea"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-5 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{editId ? "Edit Entry" : "New Content Idea"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="field-label">Status</label>
              <select className="field-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
                <option value="idea">Idea</option>
                <option value="in production">In Production</option>
                <option value="posted">Posted</option>
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">Match / Event</label>
            <input className="field-input" placeholder="e.g. Ireland v France, 6N Round 3" value={form.match} onChange={(e) => setForm({ ...form, match: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">Angle Title</label>
            <input className="field-input" placeholder="e.g. The referee was absolutely bribed" value={form.angle} onChange={(e) => setForm({ ...form, angle: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">Hook Text</label>
            <textarea className="field-input" rows={2} placeholder="Opening line to grab attention…" value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">Notes</label>
            <textarea className="field-input" rows={2} placeholder="Clips to find, tone, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : editId ? "Update" : "Save Idea"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <input className="field-input flex-1 min-w-[160px] text-sm" placeholder="Search angles, hooks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-1">
          {(["all", "idea", "in production", "posted"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border
                ${filterStatus === s ? "bg-[#00C853] text-white border-[#00C853]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No ideas yet. Hit &quot;+ New Idea&quot; to start.</p>
        )}
        {filtered.map((entry) => (
          <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">{entry.date}</span>
                {entry.match && <span className="text-xs text-gray-500 font-medium">· {entry.match}</span>}
                <button
                  onClick={() => cycleStatus(entry)}
                  className={`text-xs px-2 py-0.5 rounded border font-medium transition-opacity hover:opacity-80 ${STATUS_COLORS[entry.status]}`}
                >
                  {entry.status}
                </button>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(entry)} className="text-gray-300 hover:text-gray-600 transition-colors text-xs p-1">✏️</button>
                <button onClick={() => remove(entry.id)} className="text-gray-300 hover:text-red-500 transition-colors text-xs p-1">🗑️</button>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{entry.angle}</p>
            {entry.hook && <p className="text-xs text-gray-500 italic mb-1">&ldquo;{entry.hook}&rdquo;</p>}
            {entry.notes && <p className="text-xs text-gray-400">{entry.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
