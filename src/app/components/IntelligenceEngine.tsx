"use client";

import { useEffect, useState, useCallback } from "react";
import type { ScanResult, ProcessedStory, ContentIdea } from "../api/scan/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function viralColor(score: number) {
  if (score >= 8) return "bg-[#00C853]/20 text-[#00C853] border-[#00C853]/40";
  if (score >= 5) return "bg-amber-900/30 text-amber-300 border-amber-700/40";
  return "bg-red-900/30 text-red-400 border-red-800/40";
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  storyIdx,
  ideaIdx,
  scanId,
  onSave,
  onPost,
}: {
  idea: ContentIdea;
  storyIdx: number;
  ideaIdx: number;
  scanId: string;
  onSave: (ideaKey: string, idea: ContentIdea, scanId: string) => void;
  onPost: (ideaKey: string, idea: ContentIdea, scanId: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const ideaKey = `${storyIdx}-${ideaIdx}`;

  async function copy(text: string, label: string) {
    await copyToClipboard(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="bg-[#0d0d0d] border border-[#252525] rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-white">{idea.angle_title}</h4>
        <span className="text-xs border border-[#333] rounded px-2 py-0.5 text-gray-400 capitalize flex-shrink-0">
          {idea.format}
        </span>
      </div>

      {/* Hook */}
      <div className="bg-[#00C853]/5 border border-[#00C853]/20 rounded-lg p-3">
        <p className="text-xs text-[#00C853] font-semibold uppercase tracking-wide mb-1">Hook</p>
        <p className="text-base font-bold text-white leading-snug">{idea.hook}</p>
      </div>

      {/* Script */}
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Script</p>
        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#111] rounded-lg p-3 font-mono text-xs">
          {idea.script}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Thumbnail:</span>
        <span className="text-sm font-bold text-white bg-[#1a1a1a] px-2 py-0.5 rounded">{idea.thumbnail_text}</span>
      </div>

      {/* Caption */}
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Caption</p>
        <p className="text-sm text-gray-300 italic">{idea.caption}</p>
      </div>

      {/* Hashtags */}
      <div className="flex flex-wrap gap-1.5">
        {idea.hashtags.map((tag) => (
          <span key={tag} className="text-xs text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-[#1e1e1e]">
        <button
          onClick={() => onSave(ideaKey, idea, scanId)}
          className="btn-primary text-xs py-1.5 px-3"
        >
          💾 Save to Content Log
        </button>
        <button
          onClick={() => copy(idea.script, "script")}
          className="btn-ghost text-xs py-1.5 px-3"
        >
          {copied === "script" ? "✓ Copied!" : "📋 Copy Script"}
        </button>
        <button
          onClick={() => copy(`${idea.caption}\n\n${idea.hashtags.map((t) => `#${t}`).join(" ")}`, "caption")}
          className="btn-ghost text-xs py-1.5 px-3"
        >
          {copied === "caption" ? "✓ Copied!" : "📋 Copy Caption + Tags"}
        </button>
        <button
          onClick={() => onPost(ideaKey, idea, scanId)}
          className="btn-ghost text-xs py-1.5 px-3 border-[#00C853]/40 text-[#00C853] hover:bg-[#00C853]/10"
        >
          ✅ Mark as Posted
        </button>
      </div>
    </div>
  );
}

function StoryCard({
  story,
  storyIdx,
  scanId,
  onSave,
  onPost,
}: {
  story: ProcessedStory;
  storyIdx: number;
  scanId: string;
  onSave: (ideaKey: string, idea: ContentIdea, scanId: string) => void;
  onPost: (ideaKey: string, idea: ContentIdea, scanId: string) => void;
}) {
  const [expanded, setExpanded] = useState(storyIdx === 0);

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
      {/* Story header */}
      <button
        className="w-full text-left p-4 hover:bg-[#141414] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs text-gray-500">{story.source}</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{timeAgo(story.pubDate)}</span>
              {story.mentionCount > 1 && (
                <span className="text-xs bg-blue-900/30 text-blue-300 border border-blue-800/40 rounded px-1.5 py-0.5">
                  {story.mentionCount}× sources
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-white leading-snug mb-2">{story.headline}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs border rounded px-2 py-0.5 font-bold ${viralColor(story.viral_score)}`}>
                🔥 {story.viral_score}/10
              </span>
              <p className="text-xs text-[#00C853] italic">"{story.shithousery_angle}"</p>
            </div>
          </div>
          <span className="text-gray-600 flex-shrink-0 mt-1">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Content ideas */}
      {expanded && (
        <div className="border-t border-[#1e1e1e] p-4 space-y-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            {story.content_ideas.length} Content Idea{story.content_ideas.length !== 1 ? "s" : ""}
          </p>
          {story.content_ideas.map((idea, ideaIdx) => (
            <IdeaCard
              key={ideaIdx}
              idea={idea}
              storyIdx={storyIdx}
              ideaIdx={ideaIdx}
              scanId={scanId}
              onSave={onSave}
              onPost={onPost}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Post modal ───────────────────────────────────────────────────────────────

function PostModal({
  idea,
  onConfirm,
  onClose,
}: {
  idea: ContentIdea;
  onConfirm: (data: { views: number; likes: number; follows: number; platform: string }) => void;
  onClose: () => void;
}) {
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [follows, setFollows] = useState(0);
  const [platform, setPlatform] = useState("TikTok");

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-base font-bold text-white">Mark as Posted</h3>
        <p className="text-xs text-gray-400 italic">"{idea.hook}"</p>
        <div>
          <label className="field-label">Platform</label>
          <select className="field-input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option>TikTok</option>
            <option>Instagram Reels</option>
            <option>YouTube Shorts</option>
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

// ─── Scan progress indicator ──────────────────────────────────────────────────

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
    <div className="bg-[#0d1f12] border border-[#00C853]/30 rounded-xl p-5 text-center space-y-3">
      <div className="flex justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-[#00C853] font-semibold text-sm">{SCAN_STEPS[step]}</p>
      <div className="flex gap-1.5 justify-center">
        {SCAN_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 w-6 rounded-full transition-all duration-500 ${i <= step ? "bg-[#00C853]" : "bg-[#1e1e1e]"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Scan history ─────────────────────────────────────────────────────────────

function ScanHistory({ scans }: { scans: ScanResult[] }) {
  const [open, setOpen] = useState(false);

  if (scans.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
      >
        <span>{open ? "▲" : "▼"}</span>
        <span>Scan history ({scans.length} scan{scans.length !== 1 ? "s" : ""} in last 7 days)</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {scans.slice(1).map((scan) => (
            <div key={scan.id} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2 flex items-center justify-between text-xs text-gray-500">
              <span>{new Date(scan.timestamp).toLocaleString()}</span>
              <span>{scan.storiesFound} stories · {scan.stories.length} ideas generated</span>
              <span className="text-[#00C853]">{scan.savedIdeas.length} saved · {scan.postedIdeas.length} posted</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IntelligenceEngine() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [postTarget, setPostTarget] = useState<{ ideaKey: string; idea: ContentIdea; scanId: string } | null>(null);
  const [manualChecks, setManualChecks] = useState({ twitter: false, instagram: false });

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
      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error || "Scan failed");
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
    // Save to content.json
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
    // Mark in scan history
    await fetch("/api/scans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scanId, action: "save", ideaKey }),
    });
    alert("✅ Saved to Content Log!");
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

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-[#00C853]">⚡</span> Intelligence Engine
          </h2>
          {latestScan && (
            <p className="text-xs text-gray-500 mt-0.5">
              Last scan: {new Date(latestScan.timestamp).toLocaleString()} · {latestScan.storiesFound} stories found
            </p>
          )}
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? "Scanning…" : "⚡ Scan Now"}
        </button>
      </div>

      {/* Manual source reminders */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { key: "twitter" as const, label: "Twitter/X", icon: "🐦" },
          { key: "instagram" as const, label: "Instagram", icon: "📸" },
        ].map(({ key, label, icon }) => (
          <label
            key={key}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors select-none
              ${manualChecks[key] ? "bg-[#0d1f12] border-[#00C853]/40 text-[#00C853]" : "bg-[#111] border-[#222] text-gray-400 hover:border-[#333]"}`}
          >
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0
              ${manualChecks[key] ? "bg-[#00C853] border-[#00C853]" : "border-[#444]"}`}>
              {manualChecks[key] && <span className="text-black text-[8px] font-bold">✓</span>}
            </div>
            <input type="checkbox" className="hidden" checked={manualChecks[key]} onChange={() => setManualChecks((m) => ({ ...m, [key]: !m[key] }))} />
            {icon} {label} checked manually
          </label>
        ))}
      </div>

      {/* States */}
      {scanning && <ScanProgress />}

      {error && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 text-sm text-red-400 mb-4">
          ⚠️ {error}
        </div>
      )}

      {!scanning && !latestScan && !error && (
        <div className="text-center py-10 text-gray-600">
          <p className="text-4xl mb-3">🏉</p>
          <p className="text-sm">No scans yet. Hit <strong className="text-gray-400">Scan Now</strong> or wait for the 7am auto-scan.</p>
        </div>
      )}

      {/* Latest scan results */}
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
            />
          ))}
        </div>
      )}

      {/* Scan history */}
      <ScanHistory scans={history} />

      {/* Post modal */}
      {postTarget && (
        <PostModal
          idea={postTarget.idea}
          onConfirm={confirmPost}
          onClose={() => setPostTarget(null)}
        />
      )}
    </div>
  );
}
