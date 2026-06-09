import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import TopBar from "../../components/TopBar";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import CategoryBadge from "../../components/CategoryBadge";
import { getAllStories, readTime, formatDateShort } from "../../components/utils";
import { COMPETITIONS, COMPETITION_MAP } from "@/lib/competitions";
import type { Story } from "../../../api/stories/route";
import { getCompetitionData } from "@/lib/competition-data";
import type { Fixture, StandingRow } from "@/lib/competition-data";
import { teamInitials } from "@/lib/team-logos";

export const revalidate = 120; // rebuild every 2 minutes

type StoryExt = Story & { imageUrl?: string; imageBg?: string; imageEmoji?: string; competitions?: string[] };

export async function generateStaticParams() {
  return COMPETITIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const comp = COMPETITION_MAP[slug];
  if (!comp) return {};
  return {
    title: `${comp.name} Rugby – News, Fixtures & Analysis | Rugby Radar`,
    description: comp.description,
    openGraph: {
      title: `${comp.emoji} ${comp.name} | Rugby Radar`,
      description: comp.description,
      siteName: "Rugby Radar",
    },
  };
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default async function CompetitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const comp = COMPETITION_MAP[slug];
  if (!comp) notFound();

  const [allStories, { fixtures, standings }] = await Promise.all([
    getAllStories() as Promise<StoryExt[]>,
    getCompetitionData(slug),
  ]);

  const stories = allStories
    .filter((s) => (s.competitions || []).includes(slug) || s.category === comp.name)
    .slice(0, 6);

  return (
    <>
      <TopBar />
      <SiteHeader />

      {/* ── Hero ── */}
      <div style={{ borderLeft: `6px solid ${comp.color}`, background: "var(--card)", borderBottom: "1px solid var(--rule)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 20px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {comp.logo
              ? <img src={comp.logo} alt={comp.name} style={{ width: 56, height: 56, objectFit: "contain" }} />
              : <span style={{ fontSize: "2.5rem" }}>{comp.emoji}</span>
            }
            <span className="font-archivo" style={{
              background: comp.color, color: "#fff", fontWeight: 900,
              fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "3px 10px", borderRadius: "var(--radius)"
            }}>{comp.shortName}</span>
            <span className="font-archivo-narrow" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {comp.season} Season
            </span>
          </div>
          <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "var(--ink)", marginBottom: 14, lineHeight: 1.15 }}>
            {comp.name}
          </h1>
          <p className="font-dm-sans" style={{ fontSize: "1rem", color: "var(--mid)", lineHeight: 1.7, maxWidth: 680 }}>
            {comp.description}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 20px 60px" }}>

        {/* ── Latest Stories ── */}
        <section style={{ marginBottom: 56 }}>
          <div className="section-header">
            <span className="section-header-label">Latest {comp.name} Stories</span>
            <div className="section-header-rule" />
            <Link href={`/site?competition=${slug}`} className="section-header-link">
              See all {comp.shortName} stories →
            </Link>
          </div>

          {stories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", border: "1px dashed var(--rule)", borderRadius: "var(--radius)" }}>
              <p style={{ fontSize: "2.5rem", marginBottom: 12 }}>{comp.emoji}</p>
              <p className="font-archivo" style={{ fontWeight: 700 }}>No stories tagged yet.</p>
              <p className="font-archivo-narrow" style={{ marginTop: 6, fontSize: "0.9rem" }}>
                Stories will appear here as they&apos;re published and tagged with {comp.name}.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {stories.map((story) => (
                <Link key={story.id} href={`/site/article/${story.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card" style={{ height: "100%" }}>
                    <div style={{ height: 160, background: story.imageBg || "#1a2a1a", overflow: "hidden", position: "relative" }}>
                      {story.imageUrl ? (
                        <img src={story.imageUrl} alt={story.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ opacity: 0.2, fontSize: "5rem" }}>{story.imageEmoji || comp.emoji}</span>
                        </div>
                      )}
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
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="comp-layout">
          <div>
            {/* ── Fixtures ── */}
            {comp.hasFixtures && (
              <section style={{ marginBottom: 48 }}>
                <div className="section-header">
                  <span className="section-header-label">Fixtures & Results</span>
                  <div className="section-header-rule" />
                </div>
                {fixtures.length === 0 ? (
                  <div style={{ background: "var(--card)", border: "1px dashed var(--rule)", borderRadius: "var(--radius)", padding: "32px 24px", textAlign: "center" }}>
                    <p style={{ fontSize: "2rem", marginBottom: 10 }}>📅</p>
                    <p className="font-archivo" style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>No fixtures available yet</p>
                  </div>
                ) : (
                  <div style={{ background: "var(--card)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--rule)" }}>
                    {fixtures.map((f, i) => (
                      <div key={f.id} style={{
                        display: "grid", gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center", gap: 8, padding: "10px 16px",
                        borderBottom: i < fixtures.length - 1 ? "1px solid var(--rule)" : "none",
                        background: f.status === "live" ? "#f0fdf4" : undefined,
                      }}>
                        {/* Home team */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          <span className="font-archivo" style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)", textAlign: "right" }}>{f.homeTeam}</span>
                          {f.homeLogo ? (
                            <img src={f.homeLogo} alt={f.homeTeam} style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
                          ) : (
                            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink-2)", color: "#fff", fontSize: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{teamInitials(f.homeTeam)}</span>
                          )}
                        </div>
                        {/* Score / date */}
                        <div style={{ textAlign: "center", minWidth: 90 }}>
                          {f.status === "completed" ? (
                            <>
                              <span className="font-archivo" style={{ fontWeight: 900, fontSize: "1rem", color: "var(--ink)" }}>
                                {f.homeScore} – {f.awayScore}
                              </span>
                              <div className="font-archivo-narrow" style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>
                                {new Date(f.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
                              </div>
                            </>
                          ) : f.status === "live" ? (
                            <span style={{ background: "#00a86b", color: "#fff", fontWeight: 700, fontSize: "0.65rem", padding: "2px 7px", borderRadius: 4 }}>LIVE</span>
                          ) : (
                            <span className="font-archivo-narrow" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                              {new Date(f.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
                            </span>
                          )}
                          {f.venue && <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>{f.venue}</div>}
                        </div>
                        {/* Away team */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {f.awayLogo ? (
                            <img src={f.awayLogo} alt={f.awayTeam} style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
                          ) : (
                            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink-2)", color: "#fff", fontSize: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{teamInitials(f.awayTeam)}</span>
                          )}
                          <span className="font-archivo" style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>{f.awayTeam}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Standings ── */}
            {comp.hasStandings && (
              <section style={{ marginBottom: 48 }}>
                <div className="section-header">
                  <span className="section-header-label">Standings</span>
                  <div className="section-header-rule" />
                </div>
                {standings.length === 0 ? (
                  <div style={{ background: "var(--card)", border: "1px dashed var(--rule)", borderRadius: "var(--radius)", padding: "24px", textAlign: "center", color: "var(--muted)" }}>
                    <p className="font-archivo-narrow">Standings updating...</p>
                  </div>
                ) : (
                  <div style={{ background: "var(--card)", borderRadius: "var(--radius)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                        <thead>
                          <tr style={{ background: "var(--ink-2)", color: "#fff" }}>
                            {["Pos", "Team", "P", "W", "D", "L", "PF", "PA", "PD", "BP", "Pts"].map((h) => (
                              <th key={h} className="font-archivo" style={{ fontWeight: 700, padding: "8px 10px", textAlign: h === "Team" ? "left" : "center", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((row, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--rule)", background: i % 2 === 0 ? undefined : "rgba(0,0,0,0.02)" }}>
                              <td className="font-archivo" style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700 }}>{row.position}</td>
                              <td className="font-archivo" style={{ padding: "8px 10px", fontWeight: 600 }}>{row.team}</td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.played}</td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.won}</td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.drawn}</td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.lost}</td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.pf}</td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.pa}</td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.pd > 0 ? `+${row.pd}` : row.pd}</td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>{row.bp}</td>
                              <td className="font-archivo" style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: comp.color }}>{row.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p style={{ fontSize: "0.65rem", color: "var(--muted)", padding: "6px 12px", textAlign: "right" }}>Source: Wikipedia · updates every 3 hours</p>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* ── Evergreen Explainers sidebar ── */}
          <aside className="comp-sidebar">
            <div className="widget">
              <div className="widget-header" style={{ background: comp.color }}>
                📚 Understand the {comp.shortName}
              </div>
              <div className="widget-body">
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {comp.evergreen.map((topic) => (
                    <li key={topic} style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 10, marginBottom: 10 }}>
                      <Link
                        href={`/site/competitions/${slug}/${topic}`}
                        className="font-archivo-narrow"
                        style={{ fontSize: "0.875rem", color: "var(--ink-3)", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <span>{topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                        <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Social CTA ── */}
            <div style={{ background: "var(--ink)", color: "#fff", borderRadius: "var(--radius)", padding: "20px", marginTop: 20 }}>
              <p className="font-archivo" style={{ fontWeight: 900, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: comp.color, marginBottom: 10 }}>
                Follow Rugby Radar
              </p>
              <p className="font-archivo-narrow" style={{ fontSize: "0.85rem", color: "#aaa", lineHeight: 1.6 }}>
                Follow <a href="https://www.instagram.com/rugbyradarco/" target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}>@rugbyradarco</a> on Instagram for daily {comp.name} takes.
              </p>
              <p className="font-archivo-narrow" style={{ fontSize: "0.78rem", color: "#666", marginTop: 8 }}>
                Newsletter coming soon.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
