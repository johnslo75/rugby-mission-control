"use client";

import { useState } from "react";

export default function ShareButtons({ articleUrl, title }: { articleUrl: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const shareText = encodeURIComponent(title);

  function copyLink() {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: "2px solid var(--rule)" }}>
      <p className="font-archivo" style={{ fontWeight: 900, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14, color: "var(--ink-3)" }}>
        Share this story
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(articleUrl)}&via=rugbyradarco`}
          target="_blank" rel="noopener noreferrer" className="share-btn x">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          Post on X
        </a>
        <a href="https://www.instagram.com/rugbyradarco/"
          target="_blank" rel="noopener noreferrer" className="share-btn"
          style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", color: "#fff" }}>
          📸 Instagram
        </a>
        <a href="https://www.tiktok.com/@rugbyradar3"
          target="_blank" rel="noopener noreferrer" className="share-btn"
          style={{ background: "#010101", color: "#fff" }}>
          🎵 TikTok
        </a>
        <button onClick={copyLink} className="share-btn copy" style={{ border: "1px solid var(--rule)" }}>
          {copied ? "✓ Copied!" : "🔗 Copy link"}
        </button>
      </div>
    </div>
  );
}
