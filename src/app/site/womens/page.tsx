import TopBar from "../components/TopBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getTeamLogo, teamInitials } from "@/lib/team-logos";
import { getFixtures } from "@/lib/fixtures";
import { WOMENS_COMPETITION_NAMES } from "@/lib/womens-refresh";
import { getAllStories, formatDateShort } from "../components/utils";
import LiveRefresher from "../components/LiveRefresher";
import type { Score } from "../../api/scores/route";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Women's Rugby — Fixtures & Results | Rugby Radar",
  description: "Women's rugby fixtures and results: Six Nations, WXV, World Cup, PWR and more.",
};

function TeamCell({ name, align, logoUrl }: { name: string; align: "left" | "right"; logoUrl?: string | null }) {
  // Highlightly emblem (stored on the row) first, then the static map
  const logo = logoUrl || getTeamLogo(name);
  const img = logo
    ? <img src={logo} alt={name} style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
    : <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#1f1f1f", color: "#fff", fontSize: "0.5rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{teamInitials(name)}</span>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
      {align === "right" && <span className="font-archivo" style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)", textAlign: "right" }}>{name}</span>}
      {img}
      {align === "left" && <span className="font-archivo" style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>{name}</span>}
    </div>
  );
}

export default async function WomensPage() {
  const [{ scores: allScores, error }, allStories] = await Promise.all([
    getFixtures({
      daysBack: 7,
      daysForward: 60, // women's calendar is sparser — look further ahead
      ttlSeconds: 300,
      competitions: WOMENS_COMPETITION_NAMES,
    }),
    getAllStories().catch(() => []),
  ]);

  const womensStories = allStories
    .filter((s) => (s.category || "").toLowerCase() === "women's rugby")
    .slice(0, 6);

  const today = new Date().toISOString().slice(0, 10);

  // Recent results + everything upcoming
  const scores = allScores.filter((s) => {
    const date = s.matchDate?.slice(0, 10) || "";
    return date >= today || s.homeScore !== null;
  });

  const grouped = scores.reduce<Record<string, Score[]>>((acc, s) => {
    const date = s.matchDate?.slice(0, 10) || "unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  const formatDay = (iso: string) => {
    if (iso === "unknown") return "Date TBC";
    const d = new Date(iso + "T12:00:00");
    if (iso === today) return "Today";
    if (iso === new Date(Date.now() + 86400000).toISOString().slice(0, 10)) return "Tomorrow";
    return d.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });
  };

  const isCompleted = (s: Score) => s.status === "FT" || (s.homeScore !== null && s.awayScore !== null);
  const isLive = (s: Score) => s.status === "Live";
  const anyLive = scores.some(isLive);

  return (
    <>
      <LiveRefresher active={anyLive} />
      <TopBar />
      <SiteHeader />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 60px", boxSizing: "border-box", width: "100%" }}>
        <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--ink)", marginBottom: 6 }}>
          Women&apos;s Rugby
        </h1>
        <p className="font-archivo-narrow" style={{ color: "var(--muted)", marginBottom: 32, fontSize: "0.9rem" }}>
          Six Nations · WXV · World Cup · PWR · internationals — fixtures and results
        </p>

        {womensStories.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <div className="section-header">
              <span className="section-header-label">Latest Stories</span>
              <div className="section-header-rule" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {womensStories.map((s) => (
                <a key={s.id} href={`/site/article/${s.slug}`} className="card" style={{ textDecoration: "none", overflow: "hidden", display: "block" }}>
                  {s.imageUrl && (
                    <div style={{ height: 130, background: "#1a2a1a", overflow: "hidden" }}>
                      <img src={s.imageUrl} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "12px 14px" }}>
                    <p className="font-archivo" style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)", lineHeight: 1.3, marginBottom: 6 }}>
                      {s.title}
                    </p>
                    <p className="font-archivo-narrow" style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                      {formatDateShort(s.date)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="section-header">
          <span className="section-header-label">Fixtures &amp; Results</span>
          <div className="section-header-rule" />
        </div>

        {sortedDates.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: "2rem", marginBottom: 12 }}>🏉</p>
            <p className="font-archivo" style={{ fontWeight: 700 }}>
              {error ? "Fixtures are temporarily unavailable" : "No women's matches in the next two months"}
            </p>
            <p className="font-archivo-narrow" style={{ fontSize: "0.85rem", marginTop: 8 }}>
              {error ? "We're having trouble loading match data — please try again in a few minutes." : "Check back when the next window opens."}
            </p>
          </div>
        )}

        {sortedDates.map((date) => (
          <section key={date} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span className="font-archivo" style={{
                fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.08em",
                textTransform: "uppercase", color: date === today ? "var(--green)" : "var(--ink)",
              }}>
                {formatDay(date)}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
            </div>

            <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--rule)", overflow: "hidden" }}>
              {grouped[date].map((f, i) => {
                const completed = isCompleted(f);
                const live = isLive(f);
                return (
                  <div key={f.id} style={{
                    display: "grid", gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center", gap: 8, padding: "10px 16px",
                    borderBottom: i < grouped[date].length - 1 ? "1px solid var(--rule)" : "none",
                    background: live ? "#f0fdf4" : undefined,
                  }}>
                    <TeamCell name={f.homeTeam} align="right" logoUrl={f.homeLogo} />

                    <div style={{ textAlign: "center", minWidth: 110 }}>
                      {completed ? (
                        <>
                          <span className="font-archivo" style={{ fontWeight: 900, fontSize: "1rem", color: "var(--ink)" }}>
                            {f.homeScore} – {f.awayScore}
                          </span>
                          {f.highlightUrl && (
                            <div>
                              <a href={f.highlightUrl} target="_blank" rel="noopener noreferrer"
                                className="font-archivo-narrow"
                                style={{ display: "inline-block", marginTop: 2, padding: "1px 7px", fontSize: "0.68rem", fontWeight: 700, color: "var(--green)", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, textDecoration: "none" }}>
                                ▶ Watch highlights
                              </a>
                            </div>
                          )}
                        </>
                      ) : live ? (
                        <span style={{ background: "#00a86b", color: "#fff", fontWeight: 700, fontSize: "0.65rem", padding: "2px 8px", borderRadius: 4 }}>
                          LIVE{f.homeScore !== null ? ` ${f.homeScore} – ${f.awayScore}` : ""}
                        </span>
                      ) : (
                        <span className="font-archivo-narrow" style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                          {f.status || "TBC"}
                        </span>
                      )}
                      <div style={{ marginTop: 3 }}>
                        <span style={{
                          fontSize: "0.55rem", fontFamily: "var(--font-archivo)", fontWeight: 900,
                          color: "#fff", background: "#7c3aed",
                          padding: "1px 5px", borderRadius: 3, letterSpacing: "0.05em",
                          textTransform: "uppercase", whiteSpace: "nowrap",
                        }}>
                          {f.competition}
                        </span>
                      </div>
                    </div>

                    <TeamCell name={f.awayTeam} align="left" logoUrl={f.awayLogo} />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <SiteFooter />
    </>
  );
}
