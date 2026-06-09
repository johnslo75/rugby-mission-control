import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 120; // rebuild every 2 minutes
import TopBar from "../../components/TopBar";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import CategoryBadge from "../../components/CategoryBadge";
import { getAllStories, readTime, formatDate, daysUntil } from "../../components/utils";
import { findTeamLogosInText } from "../../components/teamLogos";
import ShareButtons from "../../components/ShareButtons";
import type { Story } from "../../../api/stories/route";

type StoryExt = Story & { imageEmoji?: string; imageBg?: string; viralScore?: number; matchInfo?: string };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const stories = await getAllStories();
  const story = stories.find((s) => s.slug === slug) as StoryExt | undefined;
  if (!story) return {};
  return {
    title: story.title,
    description: story.excerpt,
  };
}

function RelatedCard({ story }: { story: StoryExt }) {
  return (
    <a href={`/site/article/${story.slug}`} style={{ display: "block", textDecoration: "none", background: "#fff", borderRadius: "var(--radius)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden", transition: "transform 0.18s, box-shadow 0.18s" }}>
      <div style={{ height: 120, background: story.imageBg || "#1a2a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
        {story.imageEmoji || "🏉"}
      </div>
      <div style={{ padding: "12px 14px 16px" }}>
        <div style={{ marginBottom: 8 }}><CategoryBadge category={story.category} /></div>
        <p className="font-archivo" style={{ fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.35, color: "var(--ink)" }}>
          {story.title}
        </p>
      </div>
    </a>
  );
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stories = (await getAllStories()) as StoryExt[];
  const story = stories.find((s) => s.slug === slug);
  if (!story) notFound();

  const related = stories.filter((s) => s.id !== story.id && s.category === story.category).slice(0, 3);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rugbyradar.co";
  const articleUrl = `${siteUrl}/article/${story.slug}`;
  const shareText = encodeURIComponent(story.title);

  return (
    <>
      <TopBar />
      <SiteHeader />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 20px 0" }}>
        <div className="article-layout">

          {/* Article */}
          <article>
            {/* Breadcrumb */}
            <nav className="font-archivo-narrow" style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 20, display: "flex", gap: 6 }}>
              <a href="/site" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</a>
              <span>/</span>
              <a href={`/site/category/${story.category.toLowerCase().replace(/ /g, "-")}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{story.category}</a>
              <span>/</span>
              <span style={{ color: "var(--ink-3)" }}>{story.title.slice(0, 50)}…</span>
            </nav>

            {/* Header */}
            <header style={{ marginBottom: 28 }}>
              <div style={{ marginBottom: 14 }}><CategoryBadge category={story.category} link /></div>
              <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.5rem, 4vw, 2.2rem)", lineHeight: 1.2, color: "var(--ink)", marginBottom: 16 }}>
                {story.title}
              </h1>
              <p className="font-dm-sans" style={{ fontSize: "1.05rem", color: "var(--mid)", lineHeight: 1.65, marginBottom: 20 }}>
                {story.excerpt}
              </p>
              <div className="meta" style={{ display: "flex", gap: 12, paddingBottom: 20, borderBottom: "2px solid var(--rule)", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, color: "var(--ink-3)" }}>{story.author}</span>
                <span>·</span>
                <time>{formatDate(story.date)}</time>
                <span>·</span>
                <span>{readTime(story.body)} min read</span>
                {story.viralScore && (
                  <>
                    <span>·</span>
                    <span style={{ color: "var(--green)" }}>🔥 {story.viralScore}/10 viral</span>
                  </>
                )}
              </div>
            </header>

            {/* Team logos */}
            {(() => {
              const teams = findTeamLogosInText(`${story.title} ${story.excerpt} ${story.body}`);
              if (teams.length === 0) return null;
              return (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24, alignItems: "center" }}>
                  {teams.map(({ team, logo }) => (
                    <div key={team} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg)", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "4px 10px" }}>
                      <img src={logo} alt={team} style={{ width: 24, height: 24, objectFit: "contain" }} />
                      <span className="font-archivo" style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--ink-3)" }}>{team}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Hero image */}
            <div style={{ background: story.imageBg || "#1a2a1a", borderRadius: "var(--radius)", marginBottom: 32, position: "relative", overflow: "hidden" }}>
              {story.imageUrl ? (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  style={{ width: "100%", height: "auto", display: "block", maxHeight: 520, objectFit: "cover" }}
                />
              ) : (
                <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ opacity: 0.2, fontSize: "12rem" }}>{story.imageEmoji || "🏉"}</span>
                </div>
              )}
              {story.matchInfo && (
                <div style={{ position: "absolute", bottom: 12, left: 16 }}>
                  <span className="match-info">{story.matchInfo}</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="article-body" dangerouslySetInnerHTML={{ __html: story.body }} />

            {/* Share */}
            <ShareButtons articleUrl={articleUrl} title={story.title} />

            {/* Related */}
            {related.length > 0 && (
              <div style={{ marginTop: 48 }}>
                <div className="section-header" style={{ marginBottom: 20 }}>
                  <span className="section-header-label">More in {story.category}</span>
                  <div className="section-header-rule" />
                </div>
                <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {related.map((s) => <RelatedCard key={s.id} story={s} />)}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="article-sidebar" style={{ position: "sticky", top: 100 }}>
            <div style={{ background: "var(--ink)", color: "#fff", borderRadius: "var(--radius)", padding: 20, marginBottom: 20 }}>
              <p className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green-bright)", marginBottom: 16 }}>
                Follow Rugby Radar
              </p>
              {[
                { label: "📸 Instagram", href: "https://www.instagram.com/rugbyradarco/", bg: "#fff" },
                { label: "🐦 Twitter / X", href: "https://x.com/rugbyradarco", bg: "#fff" },
                { label: "🎵 TikTok", href: "https://www.tiktok.com/@rugbyradar", bg: "#fff" },
              ].map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.08)", color: "#fff", textDecoration: "none", borderRadius: "var(--radius)", padding: "10px", marginBottom: 8, fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: "0.82rem" }}>
                  {s.label}
                </a>
              ))}
            </div>

            <div style={{ background: "var(--card)", borderRadius: "var(--radius)", padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <p className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)", marginBottom: 12 }}>
                RWC 2027
              </p>
              <div className="countdown-number" style={{ fontSize: "3rem" }}>{daysUntil(new Date("2027/10/01"))}</div>
              <p className="font-archivo-narrow" style={{ fontSize: "0.78rem", color: "var(--muted)" }}>days to Rugby World Cup 2027</p>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
