"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { COMPETITIONS } from "@/lib/competitions";
import type { Story } from "../../api/stories/route";

type StoryExt = Story & { imageEmoji?: string; imageBg?: string; imageUrl?: string; competitions?: string[] };

interface Props {
  stories: StoryExt[];
  initialCompetition?: string;
  renderStory: (story: StoryExt) => React.ReactNode;
}

export default function CompetitionFilter({ stories, initialCompetition, renderStory }: Props) {
  const [selected, setSelected] = useState<string>(initialCompetition || "all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setShowFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    check();
    el.addEventListener("scroll", check);
    return () => el.removeEventListener("scroll", check);
  }, []);

  const filtered = selected === "all"
    ? stories
    : stories.filter((s) => (s.competitions || []).includes(selected));

  const selectedComp = COMPETITIONS.find((c) => c.slug === selected);

  return (
    <>
      {/* Filter chip row */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div
          ref={scrollRef}
          style={{
            display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4,
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}
        >
          {/* All chip */}
          <button
            onClick={() => setSelected("all")}
            className="font-archivo"
            style={{
              flexShrink: 0, cursor: "pointer", border: "1px solid",
              borderRadius: 20, padding: "5px 14px",
              fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap",
              transition: "all 0.15s",
              background: selected === "all" ? "var(--ink)" : "transparent",
              color: selected === "all" ? "#fff" : "var(--ink-3)",
              borderColor: selected === "all" ? "var(--ink)" : "var(--rule)",
            }}
          >
            All
          </button>

          {COMPETITIONS.map((comp) => {
            const isSelected = selected === comp.slug;
            return (
              <button
                key={comp.slug}
                onClick={() => setSelected(comp.slug)}
                className="font-archivo"
                style={{
                  flexShrink: 0, cursor: "pointer", border: "1px solid",
                  borderRadius: 20, padding: "5px 14px",
                  fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  background: isSelected ? comp.color : "transparent",
                  color: isSelected ? "#fff" : "var(--ink-3)",
                  borderColor: isSelected ? comp.color : "var(--rule)",
                }}
              >
                {comp.emoji} {comp.shortName}
              </button>
            );
          })}
        </div>

        {/* Right fade on mobile */}
        {showFade && (
          <div style={{
            position: "absolute", top: 0, right: 0, width: 48, height: "100%",
            background: "linear-gradient(to right, transparent, var(--bg))",
            pointerEvents: "none",
          }} />
        )}
      </div>

      {/* Competition header when filtered */}
      {selectedComp && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, padding: "10px 14px",
          borderLeft: `4px solid ${selectedComp.color}`,
          background: "var(--card)", borderRadius: "0 var(--radius) var(--radius) 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>{selectedComp.emoji}</span>
            <span className="font-archivo" style={{ fontWeight: 900, fontSize: "0.85rem", color: "var(--ink)" }}>
              {selectedComp.name}
            </span>
            <span className="font-archivo-narrow" style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              {filtered.length} {filtered.length === 1 ? "story" : "stories"}
            </span>
          </div>
          <Link
            href={`/site/competitions/${selectedComp.slug}`}
            className="font-archivo"
            style={{ fontSize: "0.75rem", fontWeight: 700, color: selectedComp.color, textDecoration: "none" }}
          >
            Competition page →
          </Link>
        </div>
      )}

      {/* Filtered stories */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: 12 }}>{selectedComp?.emoji || "🏉"}</p>
          <p className="font-archivo" style={{ fontWeight: 700, fontSize: "1rem" }}>
            No {selectedComp?.name} stories yet
          </p>
          <p className="font-archivo-narrow" style={{ fontSize: "0.875rem", marginTop: 6 }}>
            Stories will appear here as they&apos;re tagged with this competition.
          </p>
        </div>
      ) : (
        <>{filtered.map((story) => renderStory(story))}</>
      )}
    </>
  );
}
