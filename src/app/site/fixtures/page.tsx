import TopBar from "../components/TopBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getCompetitionData } from "@/lib/competition-data";
import { COMPETITIONS } from "@/lib/competitions";
import { getTeamLogo, teamInitials } from "@/lib/team-logos";
import type { Fixture } from "@/lib/competition-data";

export const dynamic = "force-dynamic";

interface FixtureWithMeta extends Fixture {
  competitionName: string;
  competitionColor: string;
  competitionSlug: string;
}

function TeamCell({ name, logo, align }: { name: string; logo: string | null; align: "left" | "right" }) {
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

export default async function FixturesPage() {
  // Fetch all competitions in parallel
  const competitionsWithFixtures = COMPETITIONS.filter((c) => c.hasFixtures);

  const results = await Promise.all(
    competitionsWithFixtures.map(async (comp) => {
      const { fixtures } = await getCompetitionData(comp.slug);
      return fixtures.map((f): FixtureWithMeta => ({
        ...f,
        homeLogo: getTeamLogo(f.homeTeam),
        awayLogo: getTeamLogo(f.awayTeam),
        competitionName: comp.name,
        competitionColor: comp.color,
        competitionSlug: comp.slug,
      }));
    })
  );

  const allFixtures = results.flat();

  // Group by date
  const grouped = allFixtures.reduce<Record<string, FixtureWithMeta[]>>((acc, f) => {
    const dateKey = f.date ? new Date(f.date).toISOString().slice(0, 10) : "unknown";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(f);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  // Separate past and upcoming
  const today = new Date().toISOString().slice(0, 10);
  const pastDates = sortedDates.filter((d) => d < today).slice(-7); // last 7 days
  const upcomingDates = sortedDates.filter((d) => d >= today);
  const displayDates = [...pastDates, ...upcomingDates];

  const formatDay = (iso: string) => {
    if (iso === "unknown") return "Date TBC";
    const d = new Date(iso);
    const isToday = iso === today;
    const isTomorrow = iso === new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return d.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <>
      <TopBar />
      <SiteHeader />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 60px" }}>
        <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--ink)", marginBottom: 6 }}>
          Fixtures & Results
        </h1>
        <p className="font-archivo-narrow" style={{ color: "var(--muted)", marginBottom: 32, fontSize: "0.9rem" }}>
          All competitions · last 7 days + next 60 days · updates every 3 hours
        </p>

        {displayDates.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: "2rem", marginBottom: 12 }}>📅</p>
            <p className="font-archivo" style={{ fontWeight: 700 }}>No fixtures available right now</p>
          </div>
        )}

        {displayDates.map((date) => (
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

            {/* Fixtures for this date */}
            <div style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--rule)", overflow: "hidden" }}>
              {grouped[date].map((f, i) => (
                <div key={f.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center", gap: 8, padding: "10px 16px",
                  borderBottom: i < grouped[date].length - 1 ? "1px solid var(--rule)" : "none",
                  background: f.status === "live" ? "#f0fdf4" : undefined,
                }}>
                  {/* Home */}
                  <TeamCell name={f.homeTeam} logo={f.homeLogo} align="right" />

                  {/* Score / time + competition badge */}
                  <div style={{ textAlign: "center", minWidth: 110 }}>
                    {f.status === "completed" ? (
                      <span className="font-archivo" style={{ fontWeight: 900, fontSize: "1rem", color: "var(--ink)" }}>
                        {f.homeScore} – {f.awayScore}
                      </span>
                    ) : f.status === "live" ? (
                      <span style={{ background: "#00a86b", color: "#fff", fontWeight: 700, fontSize: "0.65rem", padding: "2px 8px", borderRadius: 4 }}>LIVE</span>
                    ) : (
                      <span className="font-archivo-narrow" style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {new Date(f.date).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    <div style={{ marginTop: 3 }}>
                      <a href={`/site/competitions/${f.competitionSlug}`} style={{ textDecoration: "none" }}>
                        <span style={{
                          fontSize: "0.55rem", fontFamily: "var(--font-archivo)", fontWeight: 900,
                          color: "#fff", background: f.competitionColor,
                          padding: "1px 5px", borderRadius: 3, letterSpacing: "0.05em",
                          textTransform: "uppercase", whiteSpace: "nowrap",
                        }}>
                          {f.competitionName.replace("Gallagher ", "").replace(" Championship", "").replace(" Pacific", "")}
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* Away */}
                  <TeamCell name={f.awayTeam} logo={f.awayLogo} align="left" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SiteFooter />
    </>
  );
}
