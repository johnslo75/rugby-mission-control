import { notFound } from "next/navigation";
import TopBar from "../../../components/TopBar";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import CategoryBadge from "../../../components/CategoryBadge";
import ShareButtons from "../../../components/ShareButtons";
import { getAllStories, readTime, formatDate } from "../../../components/utils";
import { COMPETITION_MAP } from "@/lib/competitions";
import type { Story } from "../../../../api/stories/route";

export const revalidate = 120; // rebuild every 2 minutes

export default async function EvergreePage({ params }: { params: Promise<{ slug: string; topic: string }> }) {
  const { slug, topic } = await params;
  const comp = COMPETITION_MAP[slug];
  if (!comp) notFound();

  // Look up story by slug matching the topic
  const allStories = await getAllStories() as (Story & { imageUrl?: string; imageBg?: string; imageEmoji?: string })[];
  const story = allStories.find((s) => s.slug === topic || s.slug === `${slug}-${topic}`);

  const articleUrl = `https://rugbyradar.co/site/competitions/${slug}/${topic}`;

  return (
    <>
      <TopBar />
      <SiteHeader />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Breadcrumb */}
        <nav className="font-archivo-narrow" style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <a href="/site" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</a>
          <span>/</span>
          <a href="/site/competitions" style={{ color: "var(--muted)", textDecoration: "none" }}>Competitions</a>
          <span>/</span>
          <a href={`/site/competitions/${slug}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{comp.name}</a>
          <span>/</span>
          <span style={{ color: "var(--ink-3)" }}>{topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
        </nav>

        {story ? (
          <>
            {/* Competition badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              {comp.logo
                ? <img src={comp.logo} alt={comp.name} style={{ width: 28, height: 28, objectFit: "contain" }} />
                : <span>{comp.emoji}</span>
              }
              <span className="font-archivo" style={{
                background: comp.color, color: "#fff", fontWeight: 900,
                fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "2px 8px", borderRadius: "var(--radius)"
              }}>{comp.shortName}</span>
              <span className="font-archivo-narrow" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Explainer</span>
            </div>

            <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.15, color: "var(--ink)", marginBottom: 16 }}>
              {story.title}
            </h1>

            <p className="font-dm-sans" style={{ fontSize: "1.05rem", color: "var(--mid)", lineHeight: 1.65, marginBottom: 20 }}>
              {story.excerpt}
            </p>

            <div className="meta" style={{ display: "flex", gap: 12, paddingBottom: 20, borderBottom: "2px solid var(--rule)", flexWrap: "wrap", marginBottom: 32 }}>
              <span style={{ fontWeight: 700, color: "var(--ink-3)" }}>{story.author}</span>
              <span>·</span>
              <time>{formatDate(story.date)}</time>
              <span>·</span>
              <span>{readTime(story.body)} min read</span>
            </div>

            {/* Hero image */}
            {story.imageUrl && (
              <div style={{ borderRadius: "var(--radius)", marginBottom: 32, overflow: "hidden" }}>
                <img src={story.imageUrl} alt={story.title} style={{ width: "100%", height: "auto", display: "block", maxHeight: 480, objectFit: "cover" }} />
              </div>
            )}

            <div className="article-body" dangerouslySetInnerHTML={{ __html: story.body }} />
            <ShareButtons articleUrl={articleUrl} title={story.title} />
          </>
        ) : (
          /* No content yet — show placeholder */
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>{comp.emoji}</div>
            <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "1.6rem", color: "var(--ink)", marginBottom: 12 }}>
              {topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </h1>
            <p className="font-archivo-narrow" style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 8 }}>
              This explainer is coming soon.
            </p>
            <a href={`/site/competitions/${slug}`} style={{ color: "var(--green)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
              ← Back to {comp.name}
            </a>
          </div>
        )}
      </div>

      <SiteFooter />
    </>
  );
}
