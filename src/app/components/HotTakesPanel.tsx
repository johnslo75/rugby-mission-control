"use client";

import { useEffect, useState } from "react";

interface HotTake {
  id: string;
  text: string;
  source: string;
  active: boolean;
  date: string;
}

const BLANK: Omit<HotTake, "id" | "date" | "active"> = { text: "", source: "" };

export default function HotTakesPanel() {
  const [takes, setTakes] = useState<HotTake[]>([]);
  const [editing, setEditing] = useState<HotTake | null>(null);
  const [draft, setDraft] = useState(BLANK);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/hottakes");
    setTakes(await res.json() as HotTake[]);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setDraft(BLANK);
    setEditing(null);
    setIsNew(true);
  }

  function startEdit(t: HotTake) {
    setDraft({ text: t.text, source: t.source });
    setEditing(t);
    setIsNew(false);
  }

  async function save() {
    if (!draft.text.trim() || !draft.source.trim()) return alert("Text and source are required.");
    setSaving(true);
    try {
      if (isNew) {
        await fetch("/api/hottakes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
      } else if (editing) {
        await fetch("/api/hottakes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editing, ...draft }),
        });
      }
      setIsNew(false);
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(t: HotTake) {
    await fetch("/api/hottakes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, active: !t.active }),
    });
    await load();
  }

  async function deleteTake(id: string) {
    if (!confirm("Delete this hot take?")) return;
    await fetch(`/api/hottakes?id=${id}`, { method: "DELETE" });
    await load();
  }

  const showForm = isNew || editing !== null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">🔥 Hot Takes</h2>
        <button onClick={startNew} className="btn-primary text-xs py-1.5 px-3">+ New Hot Take</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-xs font-bold text-orange-700 mb-3">{isNew ? "New Hot Take" : "Edit Hot Take"}</p>
          <textarea
            className="field-input mb-2 text-sm"
            rows={3}
            placeholder="The hot take..."
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          />
          <input
            className="field-input mb-3 text-sm"
            placeholder="Source (e.g. Rugby Radar, June 2026)"
            value={draft.source}
            onChange={(e) => setDraft({ ...draft, source: e.target.value })}
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary text-xs py-1.5 px-4">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setIsNew(false); setEditing(null); }} className="btn-ghost text-xs py-1.5 px-4">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {takes.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No hot takes yet.</p>}
      <div className="space-y-3">
        {takes.map((t) => (
          <div key={t.id} className={`border rounded-lg p-3 ${t.active ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-relaxed mb-1">"{t.text}"</p>
                <p className="text-xs text-gray-500">— {t.source}</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => toggleActive(t)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${
                    t.active
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-500 border-gray-300 hover:border-orange-400 hover:text-orange-500"
                  }`}
                >
                  {t.active ? "✓ Live" : "Set Live"}
                </button>
                <button onClick={() => startEdit(t)} className="text-xs text-blue-500 hover:underline text-center">Edit</button>
                <button onClick={() => deleteTake(t.id)} className="text-xs text-red-400 hover:underline text-center">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
