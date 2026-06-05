import type { Metadata } from "next";
import Link from "next/link";
import TopBar from "../components/TopBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { COMPETITIONS_BY_REGION, REGION_LABELS } from "@/lib/competitions";
import type { Region } from "@/lib/competitions";

export const metadata: Metadata = {
  title: "Rugby Competitions – Six Nations, URC, Champions Cup & More | Rugby Radar",
  description:
    "All the rugby competitions that matter — Six Nations, URC, Champions Cup, Premiership, Top 14, Super Rugby Pacific, Rugby Championship, and World Cup 2027. News, analysis and fixtures.",
};

const REGION_ORDER: Region[] = ["northern", "southern", "global", "tier2"];

export default function CompetitionsPage() {
  return (
    <>
      <TopBar />
      <SiteHeader />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 20px 60px" }}>
        <header style={{ marginBottom: 40, paddingBottom: 16, borderBottom: "3px solid var(--accent)" }}>
          <p className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
            All Competitions
          </p>
          <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--ink)", marginBottom: 10 }}>
            Rugby Competitions
          </h1>
          <p className="font-dm-sans" style={{ fontSize: "1rem", color: "var(--mid)", maxWidth: 600, lineHeight: 1.65 }}>
            Every competition that matters, in one place. Pick your poison.
          </p>
        </header>

        {REGION_ORDER.map((region) => {
          const comps = COMPETITIONS_BY_REGION[region];
          if (!comps.length) return null;
          return (
            <section key={region} style={{ marginBottom: 52 }}>
              <div className="section-header" style={{ marginBottom: 24 }}>
                <span className="section-header-label">{REGION_LABELS[region]}</span>
                <div className="section-header-rule" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {comps.map((comp) => (
                  <Link key={comp.slug} href={`/site/competitions/${comp.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="card" style={{ height: "100%", borderTop: `3px solid ${comp.color}` }}>
                      <div style={{ padding: "20px 20px 22px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                          {comp.logo
                            ? <img src={comp.logo} alt={comp.name} style={{ width: 44, height: 44, objectFit: "contain" }} />
                            : <span style={{ fontSize: "2rem" }}>{comp.emoji}</span>
                          }
                          <div>
                            <span className="font-archivo" style={{
                              background: comp.color, color: "#fff", fontWeight: 900,
                              fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
                              padding: "2px 8px", borderRadius: "var(--radius)", display: "inline-block", marginBottom: 4
                            }}>{comp.shortName}</span>
                            <br />
                            <span className="font-archivo-narrow" style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                              {REGION_LABELS[comp.region]}
                            </span>
                          </div>
                        </div>
                        <h2 className="font-archivo" style={{ fontWeight: 900, fontSize: "1rem", color: "var(--ink)", marginBottom: 10, lineHeight: 1.25 }}>
                          {comp.name}
                        </h2>
                        <p className="font-dm-sans" style={{ fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.55 }}>
                          {comp.description.split(".")[0]}.
                        </p>
                        <div style={{ marginTop: 14 }}>
                          <span className="font-archivo" style={{ fontSize: "0.75rem", fontWeight: 700, color: comp.color }}>
                            News & Analysis →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <SiteFooter />
    </>
  );
}
