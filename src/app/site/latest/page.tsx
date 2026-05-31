import TopBar from "../components/TopBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CategoryBadge from "../components/CategoryBadge";
import { getAllStories, readTime, formatDateShort } from "../components/utils";
import type { Story } from "../../api/stories/route";

type StoryExt = Story & { imageEmoji?: string; imageBg?: string };

export default function LatestPage() {
  const stories = getAllStories() as StoryExt[];

  return (
    <>
      <TopBar />
      <SiteHeader />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 20px 60px" }}>
        <header style={{ marginBottom: 32, paddingBottom: 16, borderBottom: "3px solid var(--green)" }}>
          <p className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)", marginBottom: 8 }}>
            All Stories
          </p>
          <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "2.2rem", color: "var(--ink)" }}>Latest</h1>
          <p className="font-archivo-narrow" style={{ color: "var(--muted)", marginTop: 4 }}>{stories.length} article{stories.length !== 1 ? "s" : ""}</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {stories.map((story) => (
            <a key={story.id} href={`/site/article/${story.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div className="card" style={{ height: "100%" }}>
                <div style={{ height: 160, background: story.imageBg || "#1a2a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", position: "relative" }}>
                  <span style={{ opacity: 0.25, fontSize: "7rem" }}>{story.imageEmoji || "🏉"}</span>
                  <div style={{ position: "absolute", top: 10, left: 10 }}>
                    <CategoryBadge category={story.category} />
                  </div>
                </div>
                <div style={{ padding: "14px 16px 18px" }}>
                  <h2 className="font-archivo" style={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.35, color: "var(--ink)", marginBottom: 8 }}>
                    {story.title}
                  </h2>
                  <p className="font-dm-sans" style={{ fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.5, marginBottom: 10 }}>
                    {story.excerpt}
                  </p>
                  <div className="meta">{formatDateShort(story.date)} · {readTime(story.body)} min read</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {stories.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🏉</div>
            <p className="font-archivo" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Stories coming soon</p>
          </div>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
