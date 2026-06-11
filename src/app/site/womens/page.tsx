import TopBar from "../components/TopBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getTeamLogo, teamInitials } from "@/lib/team-logos";
import { getFixtures } from "@/lib/fixtures";
import { WOMENS_COMPETITION_NAMES } from "@/lib/womens-refresh";
import type { Score } from "../../api/scores/route";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Women's Rugby — Fixtures & Results | Rugby Radar",
  description: "Women's rugby fixtures and results: Six Nations, WXV, World Cup, PWR and more.",
};

function TeamCell({ name, align }: { name: string; align: "left" | "right" }) {
  const logo = getTeamLogo(name);
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
  const { scores: allScores, error } = await getFixtures({
    daysBack: 7,
    daysForward: 60, // women's calendar is sparser — look further ahead
    ttlSeconds: 300,
    competitions: WOMENS_COMPETITION_NAMES,
  });

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

  return (
    <>
      <TopBar />
      <SiteHeader />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 60px", boxSizing: "border-box", width: "100%" }}>
        <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--ink)", marginBottom: 6 }}>
          Women&apos;s Rugby
        </h1>
        <p className="font-archivo-narrow" style={{ color: "var(--muted)", marginBottom: 32, fontSize: "0.9rem" }}>
          Six Nations · WXV · World Cup · PWR · internationals — fixtures and results
        </p>

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
                    <TeamCell name={f.homeTeam} align="right" />

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
                                style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--green)", textDecoration: "none" }}>
                                ▶ Highlights
                              </a>
                            </div>
                          )}
                        </>
                      ) : live ? (
                        <span style={{ background: "#00a86b", color: "#fff", fontWeight: 700, fontSize: "0.65rem", padding: "2px 8px", borderRadius: 4 }}>LIVE</span>
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

                    <TeamCell name={f.awayTeam} align="left" />
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
