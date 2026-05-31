"use client";

import { useEffect, useState, useCallback } from "react";

const STAGES = [
  {
    id: "results",
    label: "Results & News",
    icon: "📰",
    sources: ["Google News alerts", "RugbyPass", "RTE Sport", "World Rugby official"],
  },
  {
    id: "fan",
    label: "Fan Reaction",
    icon: "💬",
    sources: ["Twitter/X", "Reddit r/rugbyunion", "Instagram comments"],
  },
  {
    id: "footage",
    label: "Footage & Visuals",
    icon: "🎬",
    sources: ["World Rugby YouTube", "Canva graphics", "Own reaction/ElevenLabs"],
  },
  {
    id: "tactical",
    label: "Tactical & Stats",
    icon: "📊",
    sources: ["ESPN Stats", "RugbyPass TV / The XV"],
  },
  {
    id: "claude",
    label: "Feed into Claude",
    icon: "🤖",
    sources: ["Claude master prompt", "ElevenLabs voiceover"],
  },
];

const ALL_KEYS = STAGES.flatMap((s) => s.sources.map((src) => `${s.id}__${src}`));

export default function ChecklistPanel() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");

  useEffect(() => {
    fetch("/api/checklist")
      .then((r) => r.json())
      .then((d) => {
        if (d.date === today) setChecked(d.checked ?? {});
        if (d.savedAt) setLastSaved(d.savedAt);
      });
  }, [today]);

  const save = useCallback(
    async (next: Record<string, boolean>) => {
      setSaving(true);
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, checked: next }),
      });
      const d = await res.json();
      setLastSaved(d.savedAt);
      setSaving(false);
    },
    [today]
  );

  function toggle(key: string) {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    save(next);
  }

  const total = ALL_KEYS.length;
  const done = ALL_KEYS.filter((k) => checked[k]).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Daily Checklist</h2>
        <span className="text-xs text-gray-400">{today}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{done}/{total} sources</span>
          <span className={pct === 100 ? "text-[#00C853] font-semibold" : ""}>{pct}%{pct === 100 ? " ✓ Complete!" : ""}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: "#00C853" }}
          />
        </div>
        {saving && <p className="text-xs text-gray-400 mt-1">Saving…</p>}
        {!saving && lastSaved && (
          <p className="text-xs text-gray-400 mt-1">Saved {new Date(lastSaved).toLocaleTimeString()}</p>
        )}
      </div>

      <div className="space-y-3">
        {STAGES.map((stage) => {
          const stageDone = stage.sources.filter((s) => checked[`${stage.id}__${s}`]).length;
          const stageAll = stage.sources.length;
          const complete = stageDone === stageAll;
          return (
            <div key={stage.id} className={`rounded-lg border overflow-hidden ${complete ? "border-[#00C853]/40" : "border-gray-200"}`}>
              <div className={`flex items-center justify-between px-3 py-2 border-b ${complete ? "bg-emerald-50 border-[#00C853]/20" : "bg-gray-50 border-gray-200"}`}>
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <span>{stage.icon}</span>
                  <span>{stage.label}</span>
                </span>
                <span className={`text-xs font-mono ${complete ? "text-[#00C853]" : "text-gray-400"}`}>
                  {stageDone}/{stageAll}
                </span>
              </div>
              <div className="p-2 space-y-1 bg-white">
                {stage.sources.map((src) => {
                  const key = `${stage.id}__${src}`;
                  const isChecked = !!checked[key];
                  return (
                    <label
                      key={src}
                      className={`flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer transition-colors select-none
                        ${isChecked ? "bg-emerald-50" : "hover:bg-gray-50"}`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                        ${isChecked ? "bg-[#00C853] border-[#00C853]" : "border-gray-300"}`}>
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggle(key)} />
                      <span className={`text-sm ${isChecked ? "line-through text-gray-400" : "text-gray-700"}`}>{src}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
