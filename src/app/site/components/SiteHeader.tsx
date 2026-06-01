"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV = [
  { label: "Home", href: "/site" },
  { label: "Latest", href: "/site/latest" },
  { label: "Ireland 🇮🇪", href: "/site/category/ireland" },
  { label: "Shithousery 💩", href: "/site/category/shithousery" },
  { label: "Hot Takes 🔥", href: "/site/category/hot-takes", hot: true },
  { label: "Tactical", href: "/site/category/tactical" },
  { label: "World Cup 2027 🏆", href: "/site/category/world-cup", pill: true },
  { label: "Radar", href: "/site/radar" },
];

function RadarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="3" fill="#e8ff3a" />
      <circle cx="14" cy="14" r="7" stroke="#e8ff3a" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
      <circle cx="14" cy="14" r="11" stroke="#e8ff3a" strokeWidth="1.2" strokeOpacity="0.3" fill="none" />
      <line x1="14" y1="14" x2="14" y2="3" stroke="#e8ff3a" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
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
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}
            className="mobile-menu-btn"
            aria-label="Menu"
          >
            <div style={{ width: 22, height: 2, background: "rgba(255,255,255,0.7)", marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: "rgba(255,255,255,0.7)", marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>

        {/* Nav row */}
        <nav style={{ display: "flex", gap: 2, paddingBottom: 10, flexWrap: "wrap" }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${item.hot ? " hot" : ""}${item.pill ? " pill" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#0a2540", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "12px 20px" }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${item.hot ? " hot" : ""}${item.pill ? " pill" : ""}`}
              style={{ display: "block", marginBottom: 4 }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
