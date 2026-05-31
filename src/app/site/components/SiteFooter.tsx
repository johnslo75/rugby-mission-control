"use client";
import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid #0a7c3e" }}>
                <Image src="/logo.jpg" alt="Rugby Shithousery" width={44} height={44} style={{ objectFit: "cover" }} />
              </div>
              <div className="font-archivo" style={{ fontWeight: 900, fontSize: "1.1rem", color: "#fff" }}>
                Rugby <span style={{ color: "#00C853" }}>Shit</span>housery
              </div>
            </div>
            <p className="font-archivo-narrow" style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#666", maxWidth: 280 }}>
              Ireland&apos;s home of rugby opinion. Cynical play, referee management, professional fouls,
              and the hot takes nobody else will say.
            </p>
          </div>

          {/* Topics */}
          <div>
            <div className="font-archivo" style={{ fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 14 }}>
              Topics
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Ireland", "Shithousery", "Hot Takes", "Tactical", "Underdog", "World Cup"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/site/category/${cat.toLowerCase().replace(" ", "-")}`}
                    className="font-archivo-narrow"
                    style={{ fontSize: "0.85rem", color: "#888", textDecoration: "none" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#00C853")}
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
                { label: "🎵 TikTok", href: "https://www.tiktok.com/@rugbyshithousery" },
                { label: "📸 Instagram", href: "https://www.instagram.com/rugbyshithousery/" },
                { label: "🐦 Twitter / X", href: "https://x.com/rugbyshithousery" },
                { label: "▶️ YouTube", href: "https://youtube.com/@rugbyshithousery" },
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
        <div style={{ borderTop: "1px solid #2a2a2a", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="font-archivo-narrow" style={{ fontSize: "0.75rem", color: "#555" }}>
            © {year} Rugby Shithousery. All rights reserved.
          </p>
          <p className="font-archivo-narrow" style={{ fontSize: "0.75rem", color: "#444" }}>
            Built with Claude · Powered by ElevenLabs
          </p>
        </div>
      </div>
    </footer>
  );
}
