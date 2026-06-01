"use client";
import Link from "next/link";
import Image from "next/image";

function RadarIconSmall() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="3" fill="#e8ff3a" />
      <circle cx="14" cy="14" r="7" stroke="#e8ff3a" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
      <circle cx="14" cy="14" r="11" stroke="#e8ff3a" strokeWidth="1.2" strokeOpacity="0.3" fill="none" />
      <line x1="14" y1="14" x2="14" y2="3" stroke="#e8ff3a" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Image src="/rugbyradarlogo.png" alt="Rugby Radar" width={40} height={40} style={{ objectFit: "contain" }} />
              <div className="font-archivo" style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
                <span style={{ color: "#ffffff" }}>RUGBY</span>{" "}
                <span style={{ color: "#00a86b" }}>RADAR</span>
              </div>
            </div>
            <p className="font-archivo-narrow" style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#888", maxWidth: 280 }}>
              Rugby Radar is your home for rugby intelligence — breaking news, tactical analysis,
              shithousery moments, and the stories serious fans actually care about.
              Irish-owned. Globally minded.
            </p>
            <p className="font-archivo-narrow" style={{ fontSize: "0.78rem", color: "#555", marginTop: 10 }}>
              rugbyradar.co
            </p>
          </div>

          {/* Topics */}
          <div>
            <div className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 14 }}>
              Topics
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Ireland", "Shithousery", "Hot Takes", "Tactical", "World Cup", "Radar"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/site/category/${cat.toLowerCase().replace(" ", "-")}`}
                    className="font-archivo-narrow"
                    style={{ fontSize: "0.85rem", color: "#888", textDecoration: "none" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#00a86b")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "#888")}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow */}
          <div>
            <div className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 14 }}>
              Follow
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "📸 Instagram", href: "https://www.instagram.com/rugbyradarco/" },
                { label: "🐦 Twitter / X", href: "https://x.com/rugbyradar" },
                { label: "🎵 TikTok", href: "https://www.tiktok.com/@rugbyradar" },
                { label: "▶️ YouTube", href: "https://youtube.com/@rugbyradar" },
              ].map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer"
                    className="font-archivo-narrow"
                    style={{ fontSize: "0.85rem", color: "#888", textDecoration: "none" }}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="font-archivo-narrow" style={{ fontSize: "0.75rem", color: "#555" }}>
            © {year} Rugby Radar · rugbyradar.co · All rights reserved.
          </p>
          <p className="font-archivo-narrow" style={{ fontSize: "0.75rem", color: "#444" }}>
            Rugby intelligence for serious fans
          </p>
        </div>
      </div>
    </footer>
  );
}
