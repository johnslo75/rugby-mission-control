"use client";

import { useEffect, useState, useCallback } from "react";
import type { ScanResult, ProcessedStory, ContentIdea } from "../api/scan/route";
import { findTeamLogosInText } from "../site/components/teamLogos";
import { COMPETITIONS, COMPETITIONS_BY_REGION, REGION_LABELS } from "@/lib/competitions";
import type { Region } from "@/lib/competitions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function viralColor(score: number) {
  if (score >= 8) return "bg-emerald-50 text-[#00C853] border-emerald-200";
  if (score >= 5) return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-red-50 text-red-500 border-red-200";
}

function timeAgo(iso: string) {
  const secs = (Date.now() - new Date(iso).getTime()) / 1000;
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

const REGION_ORDER: Region[] = ["northern", "southern", "global", "tier2"];

function PublishDropdown({ idea, story, onPublish, publishing, ideaKey }: {
  idea: ContentIdea;
  story: ProcessedStory;
  onPublish: (idea: ContentIdea, story: ProcessedStory, category: string) => void;
  publishing: string | null;
  ideaKey: string;
}) {
  const [open, setOpen] = useState(false);
  const isPublishing = publishing === `${idea.angle_title}-publish`;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPublishing}
        className="btn-ghost text-xs py-1.5 px-3 border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
      >
        {isPublishing ? "⏳ Publishing…" : "🌐 Publish to Site ▾"}
      </button>
      {open && (
        <div style={{
          position: "absolute", bottom: "100%", left: 0, marginBottom: 4,
          background: "#fff", border: "1px solid #e2e2e2", borderRadius: 6,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 220,
          maxHeight: 360, overflowY: "auto",
        }}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pt-2 pb-1">General</div>
            <button
              onClick={() => { setOpen(false); onPublish(idea, story, "News"); }}
              className="w-full text-left text-xs px-3 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
              style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #f0f0f0" }}
            >
              <span>📰</span><span>News</span>
            </button>
            <button
              onClick={() => { setOpen(false); onPublish(idea, story, "Analysis"); }}
              className="w-full text-left text-xs px-3 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
              style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #f0f0f0" }}
            >
              <span>📐</span><span>Analysis</span>
            </button>
          </div>
          {REGION_ORDER.map((region) => (
            <div key={region}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pt-2 pb-1">
                {REGION_LABELS[region]}
              </div>
              {COMPETITIONS_BY_REGION[region].map((comp) => (
                <button
                  key={comp.slug}
                  onClick={() => { setOpen(false); onPublish(idea, story, comp.name); }}
                  className="w-full text-left text-xs px-3 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                  style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #f0f0f0" }}
                >
                  <span>{comp.emoji}</span>
                  <span>{comp.name}</span>
                  <span className="ml-auto text-[10px] text-gray-400">{comp.shortName}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Idea Card ────────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  story,
  storyIdx,
  ideaIdx,
  scanId,
  onSave,
  onPost,
  onPublish,
  publishing,
}: {
  idea: ContentIdea;
  story: ProcessedStory;
  storyIdx: number;
  ideaIdx: number;
  scanId: string;
  onSave: (ideaKey: string, idea: ContentIdea, scanId: string) => void;
  onPost: (ideaKey: string, idea: ContentIdea, scanId: string) => void;
  onPublish: (idea: ContentIdea, story: ProcessedStory, category: string) => void;
  publishing: string | null;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const ideaKey = `${storyIdx}-${ideaIdx}`;

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
      // Strip stage directions like [0-3s] from the script for clean audio
      const cleanScript = idea.script.replace(/\[.*?\]/g, "").replace(/\s+/g, " ").trim();
      const res = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanScript }),
      });
      const data = await res.json() as { audio?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate voiceover");
      setAudioSrc(data.audio!);
    } catch (e) {
      setAudioError(e instanceof Error ? e.message : "Failed to generate voiceover");
    } finally {
      setGenerating(false);
    }
  }

  function downloadAudio() {
    if (!audioSrc) return;
    const a = document.createElement("a");
    a.href = audioSrc;
    a.download = `${idea.angle_title.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}.mp3`;
    a.click();
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-gray-900">{idea.angle_title}</h4>
        <span className="text-xs border border-gray-200 rounded px-2 py-0.5 text-gray-500 capitalize flex-shrink-0">{idea.format}</span>
      </div>

      {/* Hook */}
      <div className="bg-white border border-[#00C853]/30 rounded-lg p-3">
        <p className="text-xs text-[#00C853] font-semibold uppercase tracking-wide mb-1">Hook</p>
        <p className="text-base font-bold text-gray-900 leading-snug">{idea.hook}</p>
      </div>

      {/* Script */}
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Script</p>
        <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed bg-white border border-gray-200 rounded-lg p-3 font-mono">
          {idea.script}
        </div>
      </div>

      {/* Voiceover player */}
      {audioSrc && (
        <div className="bg-white border border-purple-200 rounded-lg p-3 space-y-2">
          <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">🎙️ Voiceover Ready</p>
          <audio controls src={audioSrc} className="w-full h-8" />
          <button onClick={downloadAudio} className="btn-ghost text-xs py-1 px-3 border-purple-200 text-purple-600 hover:bg-purple-50 w-full">
            ⬇️ Download MP3
          </button>
        </div>
      )}
      {audioError && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-2">⚠️ {audioError}</div>
      )}

      {/* Thumbnail */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">Thumbnail:</span>
        <span className="text-sm font-bold text-gray-800 bg-white border border-gray-200 px-2 py-0.5 rounded">{idea.thumbnail_text}</span>
      </div>

      {/* Caption */}
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Caption</p>
        <p className="text-sm text-gray-600 italic">{idea.caption}</p>
      </div>

      {/* Hashtags */}
      <div className="flex flex-wrap gap-1.5">
        {idea.hashtags.map((tag) => (
          <span key={tag} className="text-xs text-[#00C853] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-200">
        <button onClick={() => onSave(ideaKey, idea, scanId)} className="btn-primary text-xs py-1.5 px-3">
          💾 Save to Content Log
        </button>
        <button
          onClick={generateVoiceover}
          disabled={generating}
          className="btn-ghost text-xs py-1.5 px-3 border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50"
        >
          {generating ? "⏳ Generating…" : audioSrc ? "🎙️ Regenerate" : "🎙️ Generate Voiceover"}
        </button>
        <button onClick={() => copy(idea.script, "script")} className="btn-ghost text-xs py-1.5 px-3">
          {copied === "script" ? "✓ Copied!" : "📋 Copy Script"}
        </button>
        <button onClick={() => copy(`${idea.caption}\n\n${idea.hashtags.map((t) => `#${t}`).join(" ")}`, "caption")} className="btn-ghost text-xs py-1.5 px-3">
          {copied === "caption" ? "✓ Copied!" : "📋 Copy Caption + Tags"}
        </button>
        <button onClick={() => onPost(ideaKey, idea, scanId)} className="btn-ghost text-xs py-1.5 px-3 border-emerald-200 text-[#00a86b] hover:bg-emerald-50">
          ✅ Mark as Posted
        </button>
        <PublishDropdown idea={idea} story={story} onPublish={onPublish} publishing={publishing} ideaKey={ideaKey} />
      </div>
    </div>
  );
}

// ─── Story Card ───────────────────────────────────────────────────────────────

function StoryCard({
  story,
  storyIdx,
  scanId,
  onSave,
  onPost,
  onPublish,
  publishing,
}: {
  story: ProcessedStory;
  storyIdx: number;
  scanId: string;
  onSave: (ideaKey: string, idea: ContentIdea, scanId: string) => void;
  onPost: (ideaKey: string, idea: ContentIdea, scanId: string) => void;
  onPublish: (idea: ContentIdea, story: ProcessedStory, category: string) => void;
  publishing: string | null;
}) {
  const [expanded, setExpanded] = useState(storyIdx === 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button className="w-full text-left p-4 hover:bg-gray-50 transition-colors" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {story.isIrish && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-bold">
                  🇮🇪 Irish
                </span>
              )}
              <span className="text-xs text-gray-400">{story.source}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{timeAgo(story.pubDate)}</span>
              {story.mentionCount > 1 && (
                <span className="text-xs bg-blue-50 text-blue-500 border border-blue-200 rounded px-1.5 py-0.5">
                  {story.mentionCount}× sources
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">{story.headline}</p>
            {(() => {
              const teams = findTeamLogosInText(story.headline);
              if (teams.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {teams.map(({ team, logo }) => (
                    <div key={team} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                      <img src={logo} alt={team} style={{ width: 16, height: 16, objectFit: "contain" }} />
                      <span className="text-xs text-gray-500 font-medium">{team}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs border rounded px-2 py-0.5 font-bold ${viralColor(story.viral_score)}`}>
                🔥 {story.viral_score}/10
              </span>
              <p className="text-xs text-[#00C853] italic">&ldquo;{story.shithousery_angle}&rdquo;</p>
            </div>
          </div>
          <span className="text-gray-400 flex-shrink-0 mt-1">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
          {/* OG image preview */}
          {story.imageUrl && (
            <div style={{ position: "relative", borderRadius: 6, overflow: "hidden", maxHeight: 180 }}>
              <img
                src={story.imageUrl}
                alt={story.headline}
                style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>
                SOURCE IMAGE
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
            {story.content_ideas.length} Content Idea{story.content_ideas.length !== 1 ? "s" : ""}
          </p>
          {story.content_ideas.map((idea, ideaIdx) => (
            <IdeaCard
              key={ideaIdx}
              idea={idea}
              story={story}
              storyIdx={storyIdx}
              ideaIdx={ideaIdx}
              scanId={scanId}
              onSave={onSave}
              onPost={onPost}
              onPublish={onPublish}
              publishing={publishing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Post Modal ───────────────────────────────────────────────────────────────

function PostModal({ idea, onConfirm, onClose }: {
  idea: ContentIdea;
  onConfirm: (data: { views: number; likes: number; follows: number; platform: string }) => void;
  onClose: () => void;
}) {
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [follows, setFollows] = useState(0);
  const [platform, setPlatform] = useState("TikTok");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-gray-900">Mark as Posted</h3>
        <p className="text-xs text-gray-500 italic">&ldquo;{idea.hook}&rdquo;</p>
        <div>
          <label className="field-label">Platform</label>
          <select className="field-input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option>TikTok</option><option>Instagram Reels</option><option>YouTube Shorts</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="field-label">Views</label><input type="number" className="field-input" min={0} value={views} onChange={(e) => setViews(Number(e.target.value))} /></div>
          <div><label className="field-label">Likes</label><input type="number" className="field-input" min={0} value={likes} onChange={(e) => setLikes(Number(e.target.value))} /></div>
          <div><label className="field-label">Follows</label><input type="number" className="field-input" min={0} value={follows} onChange={(e) => setFollows(Number(e.target.value))} /></div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => onConfirm({ views, likes, follows, platform })} className="btn-primary text-sm flex-1">Confirm</button>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Scan Progress ────────────────────────────────────────────────────────────

const SCAN_STEPS = [
  "Fetching RSS feeds…",
  "Reading Reddit r/rugbyunion…",
  "Deduplicating stories…",
  "Ranking by recency + buzz…",
  "Sending to Claude AI…",
  "Generating content ideas…",
];

function ScanProgress() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 1800);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
      <div className="flex justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-[#00C853] font-semibold text-sm">{SCAN_STEPS[step]}</p>
      <div className="flex gap-1.5 justify-center">
        {SCAN_STEPS.map((_, i) => (
          <div key={i} className={`h-1 w-6 rounded-full transition-all duration-500 ${i <= step ? "bg-[#00C853]" : "bg-emerald-200"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Scan History ─────────────────────────────────────────────────────────────

function ScanHistory({ scans }: { scans: ScanResult[] }) {
  const [open, setOpen] = useState(false);
  if (scans.length === 0) return null;
  return (
    <div className="mt-4">
      <button onClick={() => setOpen((v) => !v)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5">
        <span>{open ? "▲" : "▼"}</span>
        <span>Scan history ({scans.length} scan{scans.length !== 1 ? "s" : ""} in last 7 days)</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {scans.slice(1).map((scan) => (
            <div key={scan.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between text-xs text-gray-500">
              <span>{new Date(scan.timestamp).toLocaleString()}</span>
              <span>{scan.storiesFound} stories · {scan.stories.length} ideas</span>
              <span className="text-[#00C853]">{scan.savedIdeas.length} saved · {scan.postedIdeas.length} posted</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function IntelligenceEngine({ onSaved }: { onSaved?: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [postTarget, setPostTarget] = useState<{ ideaKey: string; idea: ContentIdea; scanId: string } | null>(null);
  const [manualChecks, setManualChecks] = useState({ twitter: false, instagram: false });
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/scans")
      .then((r) => r.json())
      .then((scans: ScanResult[]) => {
        setHistory(scans);
        if (scans.length > 0) setLatestScan(scans[0]);
      });
  }, []);

  const runScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Scan failed (${res.status}): ${text.slice(0, 200)}`);
      }
      const result = await res.json() as ScanResult;
      setLatestScan(result);
      setHistory((prev) => [result, ...prev].slice(0, 7));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }, []);

  async function handleSave(ideaKey: string, idea: ContentIdea, scanId: string) {
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        match: latestScan?.stories.find((_, i) => ideaKey.startsWith(`${i}-`))?.headline || "",
        angle: idea.angle_title,
        hook: idea.hook,
        status: "idea",
        notes: `Script: ${idea.script.slice(0, 100)}…`,
      }),
    });
    await fetch("/api/scans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scanId, action: "save", ideaKey }),
    });
    alert("✅ Saved to Content Log!");
    onSaved?.();
  }

  function handlePost(ideaKey: string, idea: ContentIdea, scanId: string) {
    setPostTarget({ ideaKey, idea, scanId });
  }

  async function confirmPost(data: { views: number; likes: number; follows: number; platform: string }) {
    if (!postTarget) return;
    const { ideaKey, idea, scanId } = postTarget;
    await fetch("/api/performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        platform: data.platform,
        hook: idea.hook,
        views: data.views,
        likes: data.likes,
        followsGained: data.follows,
        format: idea.format,
        notes: idea.angle_title,
      }),
    });
    await fetch("/api/scans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scanId, action: "post", ideaKey }),
    });
    setPostTarget(null);
    alert("✅ Logged to Performance Tracker!");
  }

  async function handlePublish(idea: ContentIdea, story: ProcessedStory, category: string) {
    const key = `${idea.angle_title}-publish`;
    setPublishing(key);
    try {
      const body = `<p>${story.shithousery_angle}</p>\n\n<p>${idea.script.replace(/\[.*?\]/g, "").trim()}</p>\n\n<p><em>Hook: ${idea.hook}</em></p>`;
      const comp = COMPETITIONS.find((c) => c.name === category);
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.angle_title,
          excerpt: idea.hook,
          body,
          category,
          competitions: comp ? [comp.slug] : [],
          author: "Rugby Radar",
          date: new Date().toISOString().slice(0, 10),
          imageUrl: story.imageUrl || "",
          featured: false,
          published: true,
        }),
      });
      alert(`✅ Published to rugbyradar.co/${category.toLowerCase().replace(/ /g, "-")}!`);
    } catch {
      alert("Failed to publish. Please try again.");
    } finally {
      setPublishing(null);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span className="text-[#00C853]">⚡</span> Intelligence Engine
          </h2>
          {latestScan && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last scan: {new Date(latestScan.timestamp).toLocaleString()} · {latestScan.storiesFound} stories found
            </p>
          )}
        </div>
        <button onClick={runScan} disabled={scanning} className="btn-primary text-sm">
          {scanning ? "Scanning…" : "⚡ Scan Now"}
        </button>
      </div>

      {/* Manual reminders */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {[{ key: "twitter" as const, label: "Twitter/X", icon: "🐦" }, { key: "instagram" as const, label: "Instagram", icon: "📸" }].map(({ key, label, icon }) => (
          <label key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors select-none
            ${manualChecks[key] ? "bg-emerald-50 border-emerald-200 text-[#00C853]" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"}`}>
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${manualChecks[key] ? "bg-[#00C853] border-[#00C853]" : "border-gray-300"}`}>
              {manualChecks[key] && <span className="text-white text-[8px] font-bold">✓</span>}
            </div>
            <input type="checkbox" className="hidden" checked={manualChecks[key]} onChange={() => setManualChecks((m) => ({ ...m, [key]: !m[key] }))} />
            {icon} {label} checked manually
          </label>
        ))}
      </div>

      {scanning && <ScanProgress />}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">⚠️ {error}</div>
      )}

      {!scanning && !latestScan && !error && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">🏉</p>
          <p className="text-sm">No scans yet. Hit <strong className="text-gray-600">Scan Now</strong> or wait for the 7am auto-scan.</p>
        </div>
      )}

      {!scanning && latestScan && (
        <div className="space-y-3">
          {latestScan.stories.map((story, storyIdx) => (
            <StoryCard
              key={storyIdx}
              story={story}
              storyIdx={storyIdx}
              scanId={latestScan.id}
              onSave={handleSave}
              onPost={handlePost}
              onPublish={handlePublish}
              publishing={publishing}
            />
          ))}
        </div>
      )}

      <ScanHistory scans={history} />

      {postTarget && (
        <PostModal idea={postTarget.idea} onConfirm={confirmPost} onClose={() => setPostTarget(null)} />
      )}
    </div>
  );
}
