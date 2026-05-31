"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV = [
  { label: "Latest", href: "/site/latest" },
  { label: "Ireland", href: "/site/category/ireland" },
  { label: "Shithousery", href: "/site/category/shithousery" },
  { label: "Hot Takes 🔥", href: "/site/category/hot-takes", hot: true },
  { label: "Tactical", href: "/site/category/tactical" },
  { label: "Underdog", href: "/site/category/underdog" },
  { label: "RWC 2027", href: "/site/category/world-cup", pill: true },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px" }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 10px" }}>
          <Link href="/site" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #0a7c3e" }}>
              <Image src="/logo.jpg" alt="Rugby Shithousery" width={48} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div>
              <div className="font-archivo" style={{ fontWeight: 900, fontSize: "1.35rem", lineHeight: 1.1, color: "#0d0d0d" }}>
                Rugby <span style={{ color: "#0a7c3e" }}>Shit</span>housery
              </div>
              <div className="font-archivo-narrow" style={{ fontSize: "0.72rem", color: "#666", fontWeight: 500, letterSpacing: "0.03em" }}>
                The cynical art of winning rugby
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
            <div style={{ width: 22, height: 2, background: "#333", marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: "#333", marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: "#333" }} />
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
        <div style={{ background: "#fff", borderTop: "1px solid #e2e2e2", padding: "12px 20px" }}>
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
