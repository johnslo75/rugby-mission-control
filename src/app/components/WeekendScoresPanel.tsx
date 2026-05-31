"use client";

import { useEffect, useState } from "react";
import type { Score } from "../api/scores/route";

const COMPETITIONS = [
  "United Rugby Championship",
  "Gallagher Premiership",
  "French Top 14",
  "Super Rugby Pacific",
  "European Champions Cup",
  "Six Nations",
  "Rugby Championship",
  "International Test Match",
  "Other",
];

function ScoreRow({ score, onDelete }: { score: Score; onDelete: (id: string) => void }) {
  const isFinished = score.status === "FT" || score.status === "Final";
  const hasScore = score.homeScore !== null && score.awayScore !== null;
  const homeWon = hasScore && score.homeScore! > score.awayScore!;
  const awayWon = hasScore && score.awayScore! > score.homeScore!;

  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-white rounded-lg border border-gray-100 text-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold truncate ${homeWon ? "text-gray-900" : "text-gray-500"}`}>
            {score.homeTeam}
          </span>
          {hasScore && (
            <span className={`text-base font-black tabular-nums flex-shrink-0 ${homeWon ? "text-gray-900" : "text-gray-400"}`}>
              {score.homeScore}
            </span>
          )}
          <span className="text-gray-300 flex-shrink-0">–</span>
          {hasScore && (
            <span className={`text-base font-black tabular-nums flex-shrink-0 ${awayWon ? "text-gray-900" : "text-gray-400"}`}>
              {score.awayScore}
            </span>
          )}
          <span className={`font-semibold truncate ${awayWon ? "text-gray-900" : "text-gray-500"}`}>
            {score.awayTeam}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            isFinished ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-600"
          }`}>
            {score.status}
          </span>
          {score.source === "manual" && (
            <span className="text-xs text-gray-400">manual</span>
          )}
        </div>
      </div>
      {score.source === "manual" && (
        <button
          onClick={() => onDelete(score.id)}
          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-xs"
          title="Delete"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function AddScoreForm({ onAdded }: { onAdded: (score: Score) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    competition: "United Rugby Championship",
    homeTeam: "",
    awayTeam: "",
    homeScore: "",
    awayScore: "",
    matchDate: new Date().toISOString().slice(0, 10),
    status: "FT",
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          homeScore: form.homeScore !== "" ? parseInt(form.homeScore) : null,
          awayScore: form.awayScore !== "" ? parseInt(form.awayScore) : null,
        }),
      });
      const score = await res.json() as Score;
      onAdded(score);
      setForm({ ...form, homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost text-xs py-1.5 px-3 w-full mt-2">
        + Add Score Manually
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-3 space-y-3">
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Add Score</p>
      <select
        value={form.competition}
        onChange={(e) => setForm({ ...form, competition: e.target.value })}
        className="field-input text-sm w-full"
      >
        {COMPETITIONS.map((c) => <option key={c}>{c}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input className="field-input text-sm" placeholder="Home team" required value={form.homeTeam} onChange={(e) => setForm({ ...form, homeTeam: e.target.value })} />
        <input className="field-input text-sm" placeholder="Away team" required value={form.awayTeam} onChange={(e) => setForm({ ...form, awayTeam: e.target.value })} />
        <input className="field-input text-sm" placeholder="Home score" type="number" min="0" value={form.homeScore} onChange={(e) => setForm({ ...form, homeScore: e.target.value })} />
        <input className="field-input text-sm" placeholder="Away score" type="number" min="0" value={form.awayScore} onChange={(e) => setForm({ ...form, awayScore: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className="field-input text-sm" type="date" value={form.matchDate} onChange={(e) => setForm({ ...form, matchDate: e.target.value })} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="field-input text-sm">
          <option value="FT">Full Time</option>
          <option value="HT">Half Time</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary text-xs py-1.5 px-4">
          {saving ? "Saving…" : "Save Score"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
      </div>
    </form>
  );
}

function generateInstagramCaption(scores: Score[]): string {
  const finished = scores.filter((s) => s.homeScore !== null && s.awayScore !== null);
  if (finished.length === 0) return "";

  const grouped = new Map<string, Score[]>();
  for (const s of finished) {
    if (!grouped.has(s.competition)) grouped.set(s.competition, []);
    grouped.get(s.competition)!.push(s);
  }

  const dateStr = new Date().toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });
  let caption = `🏉 Weekend Rugby Results\n${dateStr}\n\n`;

  for (const [comp, results] of grouped) {
    caption += `📌 ${comp}\n`;
    for (const r of results) {
      const homeWon = r.homeScore! > r.awayScore!;
      const awayWon = r.awayScore! > r.homeScore!;
      caption += `${homeWon ? "✅" : awayWon ? "  " : "🤝"} ${r.homeTeam} ${r.homeScore} – ${r.awayScore} ${r.awayTeam}\n`;
    }
    caption += "\n";
  }

  caption += `#RugbyUnion #Rugby #WeekendRugby #URC #Premiership #Top14 #SuperRugby #RugbyShithousery`;
  return caption.trim();
}

function generateArticleBody(scores: Score[]): string {
  const finished = scores.filter((s) => s.homeScore !== null && s.awayScore !== null);
  const grouped = new Map<string, Score[]>();
  for (const s of finished) {
    if (!grouped.has(s.competition)) grouped.set(s.competition, []);
    grouped.get(s.competition)!.push(s);
  }

  let html = "";
  for (const [comp, results] of grouped) {
    html += `<h2>${comp}</h2>\n<ul>\n`;
    for (const r of results) {
      const homeWon = r.homeScore! > r.awayScore!;
      const awayWon = r.awayScore! > r.homeScore!;
      html += `  <li><strong>${homeWon ? r.homeTeam : r.homeTeam}</strong> ${homeWon ? `<strong>${r.homeScore} – ${r.awayScore}</strong> ${r.awayTeam}` : awayWon ? `${r.homeScore} – <strong>${r.awayScore}</strong> <strong>${r.awayTeam}</strong>` : `${r.homeScore} – ${r.awayScore} ${r.awayTeam}`}</li>\n`;
    }
    html += `</ul>\n`;
  }
  return html;
}

export default function WeekendScoresPanel() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function load(refresh = false) {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch(`/api/scores${refresh ? "?refresh=1" : ""}`);
      const data = await res.json() as Score[];
      setScores(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleDelete(id: string) {
    fetch(`/api/scores?id=${id}`, { method: "DELETE" });
    setScores((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAdded(score: Score) {
    setScores((prev) => [score, ...prev]);
  }

  async function pushToSite() {
    const finished = scores.filter((s) => s.homeScore !== null && s.awayScore !== null);
    if (finished.length === 0) return;
    setPushing(true);
    setPushResult(null);
    try {
      const dateStr = new Date().toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
      const title = `Weekend Rugby Results — ${dateStr}`;
      const body = generateArticleBody(finished);
      const comps = [...new Set(finished.map((s) => s.competition))];
      const excerpt = `All the scores and results from ${comps.slice(0, 3).join(", ")}${comps.length > 3 ? " and more" : ""} this weekend.`;
      const slug = `rugby-results-${new Date().toISOString().slice(0, 10)}`;

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          body,
          category: "results",
          author: "Mission Control",
          date: new Date().toISOString().slice(0, 10),
          imageEmoji: "🏆",
          imageBg: "#1a1a2e",
          featured: false,
          viralScore: 7,
          published: true,
          tags: ["results", "scores", "weekend"],
        }),
      });
      if (res.ok) {
        setPushResult({ ok: true, message: `✅ Published! "${title}" is now live on the site.` });
      } else {
        const err = await res.json() as { error?: string };
        setPushResult({ ok: false, message: `❌ Failed: ${err.error || res.statusText}` });
      }
    } catch (e) {
      setPushResult({ ok: false, message: `❌ Error: ${e instanceof Error ? e.message : "Unknown error"}` });
    } finally {
      setPushing(false);
    }
  }

  async function copyCaption() {
    const text = generateInstagramCaption(scores);
    setCaption(text);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Group by competition
  const grouped = new Map<string, Score[]>();
  for (const s of scores) {
    if (!grouped.has(s.competition)) grouped.set(s.competition, []);
    grouped.get(s.competition)!.push(s);
  }

  const finishedCount = scores.filter((s) => s.homeScore !== null).length;
  const scheduledCount = scores.filter((s) => s.homeScore === null).length;

  return (
    <div className="panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">🏆 Rugby Scores</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {finishedCount > 0 ? `${finishedCount} result${finishedCount !== 1 ? "s" : ""}` : ""}
            {finishedCount > 0 && scheduledCount > 0 ? " · " : ""}
            {scheduledCount > 0 ? `${scheduledCount} upcoming` : ""}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
        >
          {refreshing ? "⏳ Fetching…" : "🔄 Fetch Latest"}
        </button>
      </div>

      {/* Scores list */}
      {loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-sm">Loading scores…</p>
        </div>
      )}

      {!loading && scores.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-3xl mb-2">🏉</div>
          <p className="text-sm font-medium text-gray-500">No scores yet this weekend</p>
          <p className="text-xs mt-1">Hit <strong>Fetch Latest</strong> to pull from ESPN, or add manually below</p>
        </div>
      )}

      {!loading && grouped.size > 0 && (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([comp, results]) => (
            <div key={comp}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{comp}</p>
              <div className="space-y-1.5">
                {results.map((s) => (
                  <ScoreRow key={s.id} score={s} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddScoreForm onAdded={handleAdded} />

      {/* Instagram caption + Push to Site */}
      {finishedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">📸 Instagram Caption</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={copyCaption}
                className="btn-ghost text-xs py-1 px-3 border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                {copied ? "✓ Copied!" : "Copy Caption"}
              </button>
              <button
                onClick={pushToSite}
                disabled={pushing}
                className="btn-primary text-xs py-1 px-3 disabled:opacity-50"
              >
                {pushing ? "⏳ Publishing…" : "🌐 Push to Site"}
              </button>
            </div>
          </div>
          {pushResult && (
            <p className={`text-xs rounded-lg px-3 py-2 ${pushResult.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {pushResult.message}
            </p>
          )}
          {caption && (
            <pre className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed">
              {caption}
            </pre>
          )}
          {!caption && (
            <p className="text-xs text-gray-400">Click <strong>Copy Caption</strong> to generate and copy your Instagram post</p>
          )}
        </div>
      )}
    </div>
  );
}
