import TopBar from "../../components/TopBar";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { getAllStories, formatDate, formatDateShort } from "../../components/utils";
import type { Story } from "../../../api/stories/route";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Maeve on Matchday | Rugby Radar",
  description: "Maeve's matchday video reports — reaction, analysis and craic from the ground.",
};

// Accepts watch?v=, youtu.be/, shorts/, embed/ and live/ URLs
function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

function VideoEmbed({ id, title }: { id: string; title: string }) {
  return (
    <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: "var(--radius)", overflow: "hidden", background: "#000" }}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}

export default async function MaeveOnMatchdayPage() {
  const allStories = await getAllStories();
  const stories = allStories.filter((s) => {
    const cat = (s.category || "").toLowerCase().replace(/ /g, "-");
    return cat === "match-previews" || cat === "maeve-on-matchday";
  });

  // Newest video report is the feature; the rest gather underneath
  const videoReports = stories
    .filter((s) => youtubeId(s.videoUrl))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const [featured, ...earlier] = videoReports;
  const writtenOnly = stories.filter((s) => !youtubeId(s.videoUrl));

  return (
    <>
      <TopBar />
      <SiteHeader />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px 60px", boxSizing: "border-box", width: "100%" }}>
        <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--ink)", marginBottom: 6 }}>
          🎥 Maeve on Matchday
        </h1>
        <p className="font-archivo-narrow" style={{ color: "var(--muted)", marginBottom: 32, fontSize: "0.9rem" }}>
          Matchday video reports — reaction, analysis and craic from the ground
        </p>

        {!featured && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: "2rem", marginBottom: 12 }}>🎬</p>
            <p className="font-archivo" style={{ fontWeight: 700 }}>First report coming soon</p>
          </div>
        )}

        {featured && (
          <section style={{ marginBottom: 48 }}>
            <VideoEmbed id={youtubeId(featured.videoUrl)!} title={featured.title} />
            <h2 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.1rem, 3vw, 1.5rem)", color: "var(--ink)", margin: "16px 0 6px" }}>
              {featured.title}
            </h2>
            <p className="font-archivo-narrow" style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 8 }}>
              {featured.author} · {formatDate(featured.date)}
            </p>
            {featured.excerpt && (
              <p className="font-archivo-narrow" style={{ color: "var(--mid)", fontSize: "0.95rem", maxWidth: 720 }}>
                {featured.excerpt}
              </p>
            )}
          </section>
        )}

        {earlier.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">
              <span className="section-header-label">Earlier reports</span>
              <div className="section-header-rule" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {earlier.map((s) => (
                <div key={s.id} className="card" style={{ padding: 12 }}>
                  <VideoEmbed id={youtubeId(s.videoUrl)!} title={s.title} />
                  <p className="font-archivo" style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", margin: "10px 0 4px", lineHeight: 1.3 }}>
                    {s.title}
                  </p>
                  <p className="font-archivo-narrow" style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                    {formatDateShort(s.date)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {writtenOnly.length > 0 && (
          <section>
            <div className="section-header">
              <span className="section-header-label">More from matchday</span>
              <div className="section-header-rule" />
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {writtenOnly.map((s: Story) => (
                <a key={s.id} href={`/site/article/${s.slug}`} className="card" style={{ padding: "12px 16px", textDecoration: "none", display: "block" }}>
                  <p className="font-archivo" style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)" }}>{s.title}</p>
                  <p className="font-archivo-narrow" style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 3 }}>{formatDateShort(s.date)}</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
    </>
  );
}
