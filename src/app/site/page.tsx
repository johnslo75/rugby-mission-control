import Link from "next/link";
import pool from "@/lib/db";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";
import TopBar from "./components/TopBar";
import SiteHeader from "./components/SiteHeader";
import BreakingTicker from "./components/BreakingTicker";
import CategoryBadge from "./components/CategoryBadge";
import SiteFooter from "./components/SiteFooter";
import CompetitionFilter from "./components/CompetitionFilter";
import { getAllStories, getWeekendScores, readTime, daysUntil, formatDate, formatDateShort } from "./components/utils";
import type { Score } from "./components/utils";
import type { Story } from "../api/stories/route";
import { getTeamLogo, teamInitials } from "@/lib/team-logos";

interface HotTake { id: string; text: string; source: string; }

async function getHotTake(): Promise<HotTake | null> {
  return cached("hot-take", 300, async () => {
    const { rows } = await pool.query(
      "SELECT * FROM hottakes ORDER BY CASE WHEN active THEN 0 ELSE 1 END, date DESC LIMIT 1"
    );
    if (!rows[0]) return null;
    return { id: rows[0].id, text: rows[0].text, source: rows[0].source };
  }).catch(() => null);
}

const SIX_NATIONS = new Date("2027/02/06");
const RWC  = new Date("2027/10/01");

// ── Image placeholder ──────────────────────────────────────────────

function ImgPlaceholder({ story, className = "", style = {} }: { story: Story; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ background: (story as Story & { imageBg?: string }).imageBg || "#1a2a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", ...style }}>
      {(story as Story & { imageEmoji?: string }).imageEmoji || "🏉"}
    </div>
  );
}

// ── Hero card ──────────────────────────────────────────────────────

function HeroCard({ story }: { story: Story }) {
  const s = story as Story & { viralScore?: number; matchInfo?: string; imageEmoji?: string; imageBg?: string; videoUrl?: string };
  const hasVideo = !s.imageUrl && s.videoUrl;
  return (
    <div className="card">
      <div className="hero-img" style={{ minHeight: hasVideo ? 0 : 280, background: hasVideo ? "transparent" : (s.imageBg || "#0a2a14"), padding: hasVideo ? 0 : undefined }}>
        {hasVideo ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
            <iframe
              src={s.videoUrl}
              title="Rugby Radar"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
            <div className="hero-cat-badge"><CategoryBadge category={story.category} /></div>
            {s.viralScore && <div className="hero-viral-badge">🔥 {s.viralScore}/10</div>}
            {s.matchInfo && (
              <div className="hero-overlay"><span className="match-info">{s.matchInfo}</span></div>
            )}
          </div>
        ) : s.imageUrl ? (
          <div style={{ position: "relative", width: "100%" }}>
            <img src={s.imageUrl} alt={story.title} style={{ width: "100%", height: "auto", display: "block", maxHeight: 480, objectFit: "cover" }} />
            <div className="hero-cat-badge"><CategoryBadge category={story.category} /></div>
            {s.viralScore && <div className="hero-viral-badge">🔥 {s.viralScore}/10</div>}
            {s.matchInfo && (
              <div className="hero-overlay"><span className="match-info">{s.matchInfo}</span></div>
            )}
          </div>
        ) : (
          <>
            <div className="hero-ghost-number">01</div>
            {s.imageBg && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", opacity: 0.15 }}>
                {s.imageEmoji}
              </div>
            )}
            <div className="hero-cat-badge"><CategoryBadge category={story.category} /></div>
            {s.viralScore && <div className="hero-viral-badge">🔥 {s.viralScore}/10</div>}
            {s.matchInfo && (
              <div className="hero-overlay"><span className="match-info">{s.matchInfo}</span></div>
            )}
          </>
        )}
      </div>
      <Link href={`/site/article/${story.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block", padding: "20px 20px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <CategoryBadge category={story.category} link />
        </div>
        <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.6rem)", lineHeight: 1.25, color: "var(--ink)", marginBottom: 12 }}>
          {story.title}
        </h1>
        <p className="font-dm-sans" style={{ fontSize: "0.95rem", color: "var(--mid)", lineHeight: 1.6, marginBottom: 16 }}>
          {story.excerpt}
        </p>
        <div className="meta" style={{ display: "flex", gap: 12 }}>
          <span>{story.author}</span>
          <span>·</span>
          <span>{formatDate(story.date)}</span>
          <span>·</span>
          <span>{readTime(story.body)} min read</span>
        </div>
      </Link>
    </div>
  );
}

// ── Featured grid card ─────────────────────────────────────────────

function FeaturedCard({ story, num }: { story: Story; num: number }) {
  const s = story as Story & { imageEmoji?: string; imageBg?: string; imageUrl?: string };
  return (
    <Link href={`/site/article/${story.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div className="card" style={{ height: "100%" }}>
        <div style={{ height: 160, background: s.imageBg || "#1a2a1a", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {s.imageUrl ? (
            <img src={s.imageUrl} alt={story.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }} />
          ) : (
            <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, color: "rgba(255,255,255,0.06)", fontSize: "6rem", lineHeight: 1 }}>0{num}</span>
          )}
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <CategoryBadge category={story.category} />
          </div>
        </div>
        <div style={{ padding: "14px 16px 18px" }}>
          <h2 className="font-archivo" style={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.35, color: "var(--ink)", marginBottom: 8 }}>
            {story.title}
          </h2>
          <p className="font-dm-sans" style={{ fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.5, marginBottom: 12 }}>
            {story.excerpt}
          </p>
          <div className="meta">{formatDateShort(story.date)} · {readTime(story.body)} min</div>
        </div>
      </div>
    </Link>
  );
}

// ── Story row ──────────────────────────────────────────────────────

function StoryRow({ story }: { story: Story }) {
  const s = story as Story & { imageEmoji?: string; imageBg?: string; imageUrl?: string };
  return (
    <a href={`/site/article/${story.slug}`} className="story-row" style={{ textDecoration: "none" }}>
      <div className="story-thumb" style={{ background: s.imageBg || "#1a2a1a", overflow: "hidden", padding: 0 }}>
        {s.imageUrl ? (
          <img src={s.imageUrl} alt={story.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          s.imageEmoji || "🏉"
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 6 }}><CategoryBadge category={story.category} /></div>
        <h3 className="font-archivo" style={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.35, color: "var(--ink)", marginBottom: 4 }}>
          {story.title}
        </h3>
        <p className="font-dm-sans" style={{ fontSize: "0.8rem", color: "var(--mid)", lineHeight: 1.4, marginBottom: 6 }}>
          {story.excerpt}
        </p>
        <div className="meta">{story.author} · {formatDateShort(story.date)} · {readTime(story.body)} min read</div>
      </div>
    </a>
  );
}

// ── Countdown card ─────────────────────────────────────────────────

function CountdownCard() {
  const sixNationsDays = daysUntil(SIX_NATIONS);
  const rwcDays  = daysUntil(RWC);
  return (
    <div className="countdown-card" style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1e1e1e" }}>
        <div className="countdown-label">Days to Six Nations 2026</div>
        <div className="countdown-number">{sixNationsDays}</div>
        <div className="font-archivo-narrow" style={{ fontSize: "0.72rem", color: "#666", marginTop: 2 }}>
          6 February 2027 · Europe
        </div>
      </div>
      <div>
        <div className="countdown-label">Days to Rugby WC 2027</div>
        <div className="countdown-number">{rwcDays}</div>
        <div className="font-archivo-narrow" style={{ fontSize: "0.72rem", color: "#666", marginTop: 2 }}>
          1 October 2027 · Australia
        </div>
      </div>
    </div>
  );
}

// ── Also Today sidebar ─────────────────────────────────────────────

function AlsoToday({ stories }: { stories: Story[] }) {
  return (
    <div style={{ background: "var(--card)", borderRadius: "var(--radius)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ background: "var(--ink-2)", padding: "8px 14px" }}>
        <span className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
          Also Today
        </span>
      </div>
      <div style={{ padding: "4px 0" }}>
        {stories.map((story, i) => {
          const s = story as Story & { imageUrl?: string; imageBg?: string; imageEmoji?: string };
          return (
          <a key={story.id} href={`/site/article/${story.slug}`} style={{ display: "flex", gap: 12, padding: "10px 14px", textDecoration: "none", borderBottom: i < stories.length - 1 ? "1px solid var(--rule)" : "none" }}>
            {s.imageUrl ? (
              <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: "var(--radius)", overflow: "hidden" }}>
                <img src={s.imageUrl} alt={story.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <span className="font-archivo" style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--accent)", minWidth: 24, flexShrink: 0 }}>
                0{i + 2}
              </span>
            )}
            <div>
              <div style={{ marginBottom: 4 }}><CategoryBadge category={story.category} /></div>
              <p className="font-archivo" style={{ fontWeight: 700, fontSize: "0.82rem", lineHeight: 1.3, color: "var(--ink)" }}>
                {story.title}
              </p>
            </div>
          </a>
        );
        })}
      </div>
    </div>
  );
}

// ── Scores section ────────────────────────────────────────────────

function TeamBadge({ name }: { name: string }) {
  const logo = getTeamLogo(name);
  return logo ? (
    <img src={logo} alt={name} style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
  ) : (
    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#1f1f1f", color: "#fff", fontSize: "0.4rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {teamInitials(name)}
    </span>
  );
}

function TeamLine({ name, points, won }: { name: string; points: number | null; won: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
      <TeamBadge name={name} />
      <span className="font-archivo" style={{
        flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontWeight: won ? 800 : 400, fontSize: "0.82rem", color: won ? "var(--ink)" : "var(--mid)",
      }}>
        {name}
      </span>
      <span className="font-archivo" style={{ fontWeight: won ? 900 : 600, fontSize: "0.88rem", color: won ? "var(--ink)" : "var(--mid)", flexShrink: 0 }}>
        {points}
      </span>
    </div>
  );
}

// One team per line so long names never wrap or push the scores out of
// alignment in narrow competition cards
function ScoreRow({ score }: { score: Score }) {
  const homeWon = (score.homeScore ?? 0) > (score.awayScore ?? 0);
  const awayWon = (score.awayScore ?? 0) > (score.homeScore ?? 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid var(--rule)" }}>
      <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 3 }}>
        <TeamLine name={score.homeTeam} points={score.homeScore} won={homeWon} />
        <TeamLine name={score.awayTeam} points={score.awayScore} won={awayWon} />
      </div>
      <span style={{ width: 14, flexShrink: 0, textAlign: "center" }}>
        {score.highlightUrl && (
          <a href={score.highlightUrl} target="_blank" rel="noopener noreferrer" title="Watch highlights"
            style={{ fontSize: "0.7rem", color: "var(--green)", textDecoration: "none", fontWeight: 700 }}>
            ▶
          </a>
        )}
      </span>
    </div>
  );
}

function ScoresSection({ scores }: { scores: Score[] }) {
  if (scores.length === 0) {
    // Quiet week — say so instead of silently dropping the section
    return (
      <section style={{ marginBottom: 48 }}>
        <div className="section-header">
          <span className="section-header-label">🏆 Weekend Results</span>
          <div className="section-header-rule" />
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <p className="font-archivo-narrow" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            No matches played in the last week.{" "}
            <a href="/site/fixtures" style={{ color: "var(--green)", fontWeight: 700 }}>
              See upcoming fixtures →
            </a>
          </p>
        </div>
      </section>
    );
  }

  // Group by competition
  const grouped = new Map<string, Score[]>();
  for (const s of scores) {
    if (!grouped.has(s.competition)) grouped.set(s.competition, []);
    grouped.get(s.competition)!.push(s);
  }

  return (
    <section style={{ marginBottom: 48 }}>
      <div className="section-header">
        <span className="section-header-label">🏆 Weekend Results</span>
        <div className="section-header-rule" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {Array.from(grouped.entries()).map(([comp, results]) => (
          <div key={comp} className="card" style={{ padding: "14px 16px" }}>
            <p className="font-archivo" style={{ fontWeight: 900, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)", marginBottom: 10 }}>
              {comp}
            </p>
            {results.map((r) => <ScoreRow key={r.id} score={r} />)}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default async function HomePage() {
  const [stories, scores, hotTake] = await Promise.all([
    getAllStories().catch(() => []),
    getWeekendScores().catch(() => []),
    getHotTake().catch(() => null),
  ]);
  const hero      = stories.find((s) => (s as Story & { featured?: boolean }).featured) || stories[0];
  const rest      = stories.filter((s) => s.id !== hero?.id);
  const featured  = rest.slice(0, 3);
  const alsoToday = rest.slice(0, 4);
  const latest    = rest.slice(0, 5);

  const categories = ["ireland", "shithousery", "hot-takes", "tactical", "underdog", "world-cup"];
  const shithouseryStories = stories.filter((s) => s.category?.toLowerCase() === "shithousery").slice(0, 3);

  return (
    <>
      <TopBar />
      <SiteHeader />
      <BreakingTicker stories={stories.slice(0, 5).map((s) => ({ title: s.title, slug: s.slug }))} />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 20px 0", boxSizing: "border-box", width: "100%" }}>

        {/* ── Hero + right column ── */}
        <div className="home-main-grid">
          <div>{hero && <HeroCard story={hero} />}</div>
          <div>
            <CountdownCard />
            <AlsoToday stories={alsoToday} />
          </div>
        </div>

        {/* ── Featured grid ── */}
        {featured.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">
              <span className="section-header-label">Featured</span>
              <div className="section-header-rule" />
              <a href="/site/latest" className="section-header-link">See all →</a>
            </div>
            <div className="home-3col">
              {featured.map((s, i) => <FeaturedCard key={s.id} story={s} num={i + 2} />)}
            </div>
          </section>
        )}

        {/* ── Weekend scores ── */}
        <ScoresSection scores={scores} />

        {/* ── Latest + sidebar ── */}
        <div className="home-side-grid">
          {/* Stories with competition filter */}
          <section>
            <div className="section-header" style={{ marginBottom: 20 }}>
              <span className="section-header-label">Latest Stories</span>
              <div className="section-header-rule" />
              <a href="/site/latest" className="section-header-link">All stories →</a>
            </div>
            <CompetitionFilter
              stories={rest.slice(0, 10) as (Story & { imageEmoji?: string; imageBg?: string; imageUrl?: string; competitions?: string[] })[]}
            />
          </section>

          {/* Sidebar */}
          <aside className="home-sidebar">
            {/* Hot Take */}
            {hotTake && (
              <div className="widget" style={{ marginBottom: 20 }}>
                <div className="widget-header red">🔥 Hot Take</div>
                <div className="widget-body">
                  <p className="hot-take-text">&ldquo;{hotTake.text}&rdquo;</p>
                  <p className="hot-take-source">— {hotTake.source}</p>
                </div>
              </div>
            )}

            {/* About */}
            <div className="widget" style={{ marginBottom: 20 }}>
              <div className="widget-header dark">About</div>
              <div className="widget-body">
                <p className="font-dm-sans" style={{ fontSize: "0.85rem", color: "var(--mid)", lineHeight: 1.6, marginBottom: 14 }}>
                  Rugby Radar is your home for rugby intelligence — breaking news, tactical analysis, shithousery moments, and the stories serious fans actually care about. Irish-owned. Globally minded.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href="https://www.instagram.com/rugbyradarco/" target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, background: "var(--primary)", color: "#fff", textAlign: "center", padding: "8px 0", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-archivo)" }}>
                    📸 Instagram
                  </a>
                  <a href="https://www.tiktok.com/@rugbyradar" target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, background: "var(--accent)", color: "#fff", textAlign: "center", padding: "8px 0", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-archivo)" }}>
                    🎵 TikTok
                  </a>
                </div>
              </div>
            </div>

            {/* Browse topics */}
            <div className="widget">
              <div className="widget-header green">Browse Topics</div>
              <div className="widget-body">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categories.map((cat) => (
                    <a key={cat} href={`/site/category/${cat}`}
                      style={{ background: "var(--bg)", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "4px 12px", fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font-archivo)", color: "var(--ink-3)", textDecoration: "none", textTransform: "capitalize" }}>
                      {cat.replace("-", " ")}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Shithousery section ── */}
      {shithouseryStories.length > 0 && (
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px 48px" }}>
          <section>
            <div className="section-header">
              <span className="section-header-label">💩 Shithousery</span>
              <div className="section-header-rule" />
              <a href="/site/category/shithousery" className="section-header-link">All shithousery →</a>
            </div>
            <p className="font-archivo-narrow" style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 20, fontStyle: "italic" }}>
              The cynical art of winning rugby. Professional fouls, referee management, dark arts, and controversy.
            </p>
            <div className="home-3col">
              {shithouseryStories.map((s, i) => <FeaturedCard key={s.id} story={s} num={i + 1} />)}
            </div>
          </section>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
