"use client";

import { useEffect, useState } from "react";
import type { ContentIdea, ProcessedStory } from "../api/scan/route";

interface FlatIdea {
  idea: ContentIdea;
  story: ProcessedStory;
  scanDate: string;
  rank: number;
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

function IdeaRow({ flat, rank }: { flat: FlatIdea; rank: number }) {
  const { idea, story, scanDate } = flat;
  const [copied, setCopied] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function copy(text: string, label: string) {
    await copyToClipboard(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  async function generateVoiceover() {
    setGenerating(true);
    setAudioError(null);
    setAudioSrc(null);
    try {
      const cleanScript = idea.script.replace(/\[.*?\]/g, "").replace(/\s+/g, " ").trim();
      const res = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanScript }),
      });
      const data = await res.json() as { audio?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      setAudioSrc(data.audio!);
    } catch (e) {
      setAudioError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  }

  async function saveToContentLog() {
    setSaving(true);
    try {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.angle_title,
          hook: idea.hook,
          script: idea.script,
          caption: `${idea.caption}\n\n${idea.hashtags.map((t) => `#${t}`).join(" ")}`,
          category: story.source,
          status: "idea",
          source: "best-ideas",
          viralScore: story.viral_score,
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const scoreColor =
    story.viral_score >= 8
      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
      : story.viral_score >= 5
      ? "bg-amber-50 text-amber-600 border-amber-200"
      : "bg-red-50 text-red-500 border-red-200";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Rank */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-black flex items-center justify-center">
          {rank}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold border rounded-full px-2 py-0.5 ${scoreColor}`}>
              🔥 {story.viral_score}/10
            </span>
            <span className="text-xs text-gray-400">{story.source}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{new Date(scanDate).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>
          </div>
          <p className="text-sm font-bold text-gray-900 leading-snug">{idea.angle_title}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{idea.hook}</p>
        </div>

        {/* Expand toggle */}
        <span className="text-gray-400 text-sm flex-shrink-0">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
          {/* Hook */}
          <div className="bg-white border border-[#00C853]/30 rounded-lg p-3">
            <p className="text-xs text-[#00C853] font-semibold uppercase tracking-wide mb-1">Hook</p>
            <p className="text-sm font-bold text-gray-900">{idea.hook}</p>
          </div>

          {/* Script */}
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Script</p>
            <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border border-gray-200 rounded-lg p-3 font-mono">
              {idea.script}
            </div>
          </div>

          {/* Voiceover player */}
          {audioSrc && (
            <div className="bg-white border border-purple-200 rounded-lg p-3 space-y-2">
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">🎙️ Voiceover Ready</p>
              <audio controls src={audioSrc} className="w-full h-8" />
              <button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = audioSrc;
                  a.download = `${idea.angle_title.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}.mp3`;
                  a.click();
                }}
                className="btn-ghost text-xs py-1 px-3 border-purple-200 text-purple-600 hover:bg-purple-50 w-full"
              >
                ⬇️ Download MP3
              </button>
            </div>
          )}
          {audioError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-2">⚠️ {audioError}</p>
          )}

          {/* Caption + hashtags */}
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Caption</p>
            <p className="text-sm text-gray-600 italic">{idea.caption}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {idea.hashtags.map((tag) => (
              <span key={tag} className="text-xs text-[#00C853] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-200">
            <button
              onClick={saveToContentLog}
              disabled={saving || saved}
              className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
            >
              {saved ? "✓ Saved!" : saving ? "Saving…" : "💾 Save to Content Log"}
            </button>
            <button
              onClick={generateVoiceover}
              disabled={generating}
              className="btn-ghost text-xs py-1.5 px-3 border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50"
            >
              {generating ? "⏳ Generating…" : audioSrc ? "🎙️ Regenerate" : "🎙️ Voiceover"}
            </button>
            <button onClick={() => copy(idea.script, "script")} className="btn-ghost text-xs py-1.5 px-3">
              {copied === "script" ? "✓ Copied!" : "📋 Copy Script"}
            </button>
            <button onClick={() => copy(`${idea.caption}\n\n${idea.hashtags.map((t) => `#${t}`).join(" ")}`, "caption")} className="btn-ghost text-xs py-1.5 px-3">
              {copied === "caption" ? "✓ Copied!" : "📋 Copy Caption"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BestIdeasPanel() {
  const [ideas, setIdeas] = useState<FlatIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"score" | "date">("score");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/scans");
        const scans = await res.json() as Array<{
          id: string;
          timestamp: string;
          stories: ProcessedStory[];
        }>;

        const flat: FlatIdea[] = [];
        const seen = new Set<string>();

        for (const scan of scans) {
          for (const story of scan.stories || []) {
            for (const idea of story.content_ideas || []) {
              // Deduplicate by angle title
              const key = idea.angle_title.toLowerCase().trim();
              if (seen.has(key)) continue;
              seen.add(key);
              flat.push({ idea, story, scanDate: scan.timestamp, rank: 0 });
            }
          }
        }

        // Sort and assign rank
        const sorted = flat
          .sort((a, b) =>
            sortBy === "score"
              ? b.story.viral_score - a.story.viral_score
              : new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime()
          )
          .map((f, i) => ({ ...f, rank: i + 1 }));

        setIdeas(sorted);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sortBy]);

  const thisWeek = ideas.filter((f) => {
    const age = (Date.now() - new Date(f.scanDate).getTime()) / 86400000;
    return age <= 7;
  });

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">⭐ This Week&apos;s Best Ideas</h2>
          <p className="text-xs text-gray-500 mt-0.5">{thisWeek.length} idea{thisWeek.length !== 1 ? "s" : ""} from the last 7 days</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["score", "date"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                sortBy === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {s === "score" ? "🔥 By Score" : "🕐 By Date"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-sm">Loading ideas…</p>
        </div>
      )}

      {!loading && thisWeek.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">🏉</div>
          <p className="text-sm font-medium text-gray-500">No scan results yet this week</p>
          <p className="text-xs mt-1">Run a scan in the Intelligence Engine to generate ideas</p>
        </div>
      )}

      {!loading && thisWeek.length > 0 && (
        <div className="space-y-3">
          {thisWeek.map((flat) => (
            <IdeaRow key={`${flat.idea.angle_title}-${flat.scanDate}`} flat={flat} rank={flat.rank} />
          ))}
        </div>
      )}
    </div>
  );
}
