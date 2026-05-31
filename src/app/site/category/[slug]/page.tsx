import TopBar from "../../components/TopBar";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import CategoryBadge from "../../components/CategoryBadge";
import { getAllStories, readTime, formatDateShort } from "../../components/utils";
import type { Story } from "../../../api/stories/route";

type StoryExt = Story & { imageEmoji?: string; imageBg?: string };

const SLUG_TO_LABEL: Record<string, string> = {
  ireland: "Ireland",
  shithousery: "Shithousery",
  "hot-takes": "Hot Takes",
  tactical: "Tactical",
  underdog: "Underdog",
  "world-cup": "World Cup",
};

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_LABEL).map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = SLUG_TO_LABEL[slug] || slug;
  const labelLower = label.toLowerCase();
  const allStories = (await getAllStories()) as StoryExt[];
  const stories = allStories.filter((s) => {
    if (!s.category || typeof s.category !== "string") return false;
    const cat = s.category.toLowerCase();
    return cat.replace(/ /g, "-") === slug || cat === labelLower;
  });

  return (
    <>
      <TopBar />
      <SiteHeader />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 20px 60px" }}>
        <header style={{ marginBottom: 32, paddingBottom: 16, borderBottom: "3px solid var(--green)" }}>
          <p className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)", marginBottom: 8 }}>
            Category
          </p>
          <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "2.2rem", color: "var(--ink)" }}>{label}</h1>
          <p className="font-archivo-narrow" style={{ color: "var(--muted)", marginTop: 4 }}>{stories.length} article{stories.length !== 1 ? "s" : ""}</p>
        </header>

        {stories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🏉</div>
            <p className="font-archivo" style={{ fontWeight: 700, fontSize: "1.1rem" }}>No stories in this category yet</p>
          </div>
        ) : (
          <>
            {/* Top 3 large */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
              {stories.slice(0, 3).map((story) => (
                <a key={story.id} href={`/site/article/${story.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <div className="card">
                    <div style={{ height: 160, background: story.imageBg || "#1a2a1a", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <span style={{ opacity: 0.15, fontSize: "7rem" }}>{story.imageEmoji || "🏉"}</span>
                      <div style={{ position: "absolute", top: 10, left: 10 }}><CategoryBadge category={story.category} /></div>
                    </div>
                    <div style={{ padding: "14px 16px 18px" }}>
                      <h2 className="font-archivo" style={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.35, color: "var(--ink)", marginBottom: 8 }}>{story.title}</h2>
                      <p className="font-dm-sans" style={{ fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.5, marginBottom: 10 }}>{story.excerpt}</p>
                      <div className="meta">{formatDateShort(story.date)} · {readTime(story.body)} min read</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Rest as rows */}
            {stories.slice(3).map((story) => (
              <a key={story.id} href={`/site/article/${story.slug}`} className="story-row">
                <div className="story-thumb" style={{ background: story.imageBg || "#1a2a1a" }}>{story.imageEmoji || "🏉"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 6 }}><CategoryBadge category={story.category} /></div>
                  <h3 className="font-archivo" style={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.35, color: "var(--ink)", marginBottom: 4 }}>{story.title}</h3>
                  <p className="font-dm-sans" style={{ fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.4 }}>{story.excerpt}</p>
                  <div className="meta" style={{ marginTop: 4 }}>{formatDateShort(story.date)} · {readTime(story.body)} min</div>
                </div>
              </a>
            ))}
          </>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
