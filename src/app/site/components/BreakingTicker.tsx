"use client";

interface Props {
  stories: { title: string; slug: string }[];
}

export default function BreakingTicker({ stories }: Props) {
  if (!stories.length) return null;

  // Duplicate for seamless loop
  const items = [...stories, ...stories];

  return (
    <div className="ticker-wrap">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <span className="ticker-badge" style={{ flexShrink: 0 }}>Breaking</span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track">
            {items.map((story, i) => (
              <a
                key={i}
                href={`/site/article/${story.slug}`}
                className="ticker-item"
                style={{ textDecoration: "none" }}
              >
                {story.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
