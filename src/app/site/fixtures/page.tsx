import TopBar from "../components/TopBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getTeamLogo, teamInitials } from "@/lib/team-logos";
import { COMPETITIONS } from "@/lib/competitions";
import { getFixtures } from "@/lib/fixtures";
import { getLastScoresRefresh } from "@/lib/scores-refresh";
import { WOMENS_COMPETITION_NAMES } from "@/lib/womens-refresh";
import LiveRefresher from "../components/LiveRefresher";
import type { Score } from "../../api/scores/route";

export const dynamic = "force-dynamic";

// Map competition names from scores DB to our competition slugs/colors
const COMP_META: Record<string, { slug: string; color: string }> = {
  "United Rugby Championship":  { slug: "urc",                color: "#00a86b" },
  "Gallagher Premiership":      { slug: "premiership",         color: "#b45309" },
  "French Top 14":              { slug: "top-14",              color: "#be123c" },
  "Super Rugby Pacific":        { slug: "super-rugby-pacific", color: "#0369a1" },
  "European Champions Cup":     { slug: "champions-cup",       color: "#1d4ed8" },
  "Six Nations":                { slug: "six-nations",         color: "#1a3a6b" },
  "Rugby Championship":         { slug: "rugby-championship",  color: "#065f46" },
  "International Test Match":   { slug: "rugby-championship",  color: "#065f46" },
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

function timeAgo(when: string | number): string {
  const mins = Math.round((Date.now() - new Date(when).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function FixturesPage() {
  // Pull from scores DB — this includes both results and upcoming fixtures
  const { scores: allScores, updatedAt, stale, error } = await getFixtures({
    daysBack: 7,
    daysForward: 30,
    ttlSeconds: 300,
    excludeCompetitions: WOMENS_COMPETITION_NAMES,
  });
  const lastRefresh = await getLastScoresRefresh();

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().slice(0, 10);

  // Keep results from the last week (so the previous round and its
  // highlights stay visible between rounds) + all upcoming fixtures
  const scores = allScores.filter((s) => {
    const date = s.matchDate?.slice(0, 10) || "";
    if (date >= today) return true; // upcoming
    if (date >= cutoff && s.homeScore !== null) return true; // recent results
    return false;
  });

  // Group by date
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

  const isCompleted = (s: Score) => s.status === "FT" || s.status === "Final" || (s.homeScore !== null && s.awayScore !== null);
  const isLive = (s: Score) => s.status === "Live" || s.status === "live";
  const anyLive = scores.some(isLive);

  if (sortedDates.length === 0) {
    console.warn(
      `[fixtures-page] rendering empty: error=${error} stale=${stale} rawCount=${allScores.length} lastRefresh=${lastRefresh?.at ?? "never"}`
    );
  }

  return (
    <>
      <LiveRefresher active={anyLive} />
      <TopBar />
      <SiteHeader />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 60px", boxSizing: "border-box", width: "100%" }}>
        <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--ink)", marginBottom: 6 }}>
          Fixtures & Results
        </h1>
        <p className="font-archivo-narrow" style={{ color: "var(--muted)", marginBottom: 32, fontSize: "0.9rem" }}>
          All competitions{lastRefresh ? ` · scores updated ${timeAgo(lastRefresh.at)}` : " · updates every 15 minutes"}
        </p>

        {/* Only warn when data is older than two refresh cycles — routine
            cache turnover on a quiet page isn't an interruption */}
        {stale && updatedAt && Date.now() - updatedAt > 30 * 60 * 1000 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "var(--radius)", padding: "10px 16px", marginBottom: 24 }}>
            <p className="font-archivo-narrow" style={{ fontSize: "0.82rem", color: "#92400e" }}>
              ⚠️ Live updates are interrupted — showing fixtures saved {timeAgo(updatedAt)}.
            </p>
          </div>
        )}

        {sortedDates.length === 0 && error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</p>
            <p className="font-archivo" style={{ fontWeight: 700 }}>Fixtures are temporarily unavailable</p>
            <p className="font-archivo-narrow" style={{ fontSize: "0.85rem", marginTop: 8 }}>
              We&apos;re having trouble loading match data — please try again in a few minutes.
            </p>
          </div>
        )}

        {sortedDates.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: "2rem", marginBottom: 12 }}>📅</p>
            <p className="font-archivo" style={{ fontWeight: 700 }}>No fixtures available right now</p>
          </div>
        )}

        {sortedDates.map((date) => (
          <div key={date} style={{ marginBottom: 36 }}>
            {/* Date header */}
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
                const meta = COMP_META[f.competition];
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
                        {meta ? (
                          <a href={`/site/competitions/${meta.slug}`} style={{ textDecoration: "none" }}>
                            <span style={{
                              fontSize: "0.55rem", fontFamily: "var(--font-archivo)", fontWeight: 900,
                              color: "#fff", background: meta.color,
                              padding: "1px 5px", borderRadius: 3, letterSpacing: "0.05em",
                              textTransform: "uppercase", whiteSpace: "nowrap",
                            }}>
                              {f.competition.replace("Gallagher ", "").replace(" Pacific", "").replace("European ", "").replace("French ", "")}
                            </span>
                          </a>
                        ) : (
                          <span style={{ fontSize: "0.55rem", color: "var(--muted)" }}>{f.competition}</span>
                        )}
                      </div>
                    </div>

                    <TeamCell name={f.awayTeam} align="left" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <SiteFooter />
    </>
  );
}
