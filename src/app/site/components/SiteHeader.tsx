"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { COMPETITIONS_BY_REGION, REGION_LABELS } from "@/lib/competitions";
import type { Region } from "@/lib/competitions";

const REGION_ORDER: Region[] = ["northern", "southern", "global", "tier2"];

const NAV = [
  { label: "Home", href: "/site" },
  { label: "News", href: "/site/latest" },
  { label: "Fixtures", href: "/site/fixtures" },
  { label: "Match Previews", href: "/site/category/match-previews" },
  { label: "Analysis", href: "/site/category/tactical" },
];

function CompetitionsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="nav-link"
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
      >
        Competitions
        <span style={{ fontSize: "0.6rem", opacity: 0.7, marginTop: 1 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          background: "#fff", border: "1px solid var(--rule)",
          borderRadius: "var(--radius)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 200, minWidth: 260, padding: "8px 0",
        }}>
          {REGION_ORDER.map((region) => {
            const comps = COMPETITIONS_BY_REGION[region];
            if (!comps.length) return null;
            return (
              <div key={region}>
                <div style={{
                  padding: "6px 16px 4px",
                  fontSize: "0.6rem", fontFamily: "var(--font-archivo)", fontWeight: 900,
                  letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)",
                }}>
                  {REGION_LABELS[region]}
                </div>
                {comps.map((comp) => (
                  <Link
                    key={comp.slug}
                    href={`/site/competitions/${comp.slug}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "7px 16px", textDecoration: "none",
                      color: "var(--ink-3)", fontSize: "0.82rem",
                      fontFamily: "var(--font-dm-sans)",
                      transition: "background 0.12s",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>{comp.emoji}</span>
                    <span style={{ flex: 1 }}>{comp.name}</span>
                    <span style={{
                      fontSize: "0.6rem", fontFamily: "var(--font-archivo)", fontWeight: 900,
                      color: "#fff", background: comp.color,
                      padding: "1px 6px", borderRadius: "var(--radius)",
                    }}>{comp.shortName}</span>
                  </Link>
                ))}
                {region !== "tier2" && <div style={{ height: 1, background: "var(--rule)", margin: "6px 0" }} />}
              </div>
            );
          })}
          <div style={{ height: 1, background: "var(--rule)", margin: "6px 0" }} />
          <Link
            href="/site/competitions"
            onClick={() => setOpen(false)}
            style={{
              display: "block", padding: "8px 16px", textDecoration: "none",
              fontSize: "0.78rem", fontFamily: "var(--font-archivo)", fontWeight: 700,
              color: "var(--accent)", textAlign: "center",
            }}
          >
            View all competitions →
          </Link>
        </div>
      )}
    </div>
  );
}

function MobileAccordion({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="nav-link"
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, width: "100%", marginBottom: 4 }}
      >
        Competitions <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ paddingLeft: 12, paddingBottom: 8 }}>
          {REGION_ORDER.map((region) => {
            const comps = COMPETITIONS_BY_REGION[region];
            if (!comps.length) return null;
            return (
              <div key={region} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: "0.6rem", fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4, padding: "0 10px" }}>
                  {REGION_LABELS[region]}
                </p>
                {comps.map((comp) => (
                  <Link
                    key={comp.slug}
                    href={`/site/competitions/${comp.slug}`}
                    className="nav-link"
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}
                    onClick={onClose}
                  >
                    {comp.emoji} {comp.name}
                  </Link>
                ))}
              </div>
            );
          })}
          <Link href="/site/competitions" className="nav-link" style={{ display: "block", marginTop: 4 }} onClick={onClose}>
            → All Competitions
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px" }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 10px" }}>
          <Link href="/site" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/rugbyradarlogo.png" alt="Rugby Radar" width={72} height={72} style={{ objectFit: "contain" }} />
            <div>
              <div className="font-archivo" style={{ fontWeight: 900, fontSize: "1.35rem", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                <span style={{ color: "#ffffff" }}>RUGBY</span>
                {" "}
                <span style={{ color: "#00a86b" }}>RADAR</span>
              </div>
              <div className="font-archivo-narrow" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: "0.03em" }}>
                Rugby intelligence for serious fans
              </div>
            </div>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            className="mobile-menu-btn"
            aria-label="Menu"
          >
            <div style={{ width: 22, height: 2, background: "rgba(255,255,255,0.7)", marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: "rgba(255,255,255,0.7)", marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>

        {/* Desktop Nav row */}
        <nav className="site-header-nav" style={{ gap: 2, paddingBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
          <CompetitionsDropdown />
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#0a2540", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "12px 20px" }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              style={{ display: "block", marginBottom: 4 }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <MobileAccordion onClose={() => setMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
