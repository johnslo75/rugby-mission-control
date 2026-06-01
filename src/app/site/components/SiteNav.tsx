import Link from "next/link";

const NAV_LINKS = [
  { label: "Latest", href: "/site" },
  { label: "Ireland", href: "/site/category/ireland" },
  { label: "World Cup", href: "/site/category/world-cup" },
  { label: "Shithousery", href: "/site/category/shithousery" },
  { label: "Hot Takes", href: "/site/category/hot-takes" },
  { label: "Radar", href: "/site/radar" },
];

export default function SiteNav() {
  return (
    <nav className="site-nav">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/site" className="flex items-center gap-2">
            <span className="text-2xl">📡</span>
            <span className="font-headline font-bold text-lg leading-none">
              <span className="text-gray-900">RUGBY</span>{" "}
              <span style={{ color: "#00a86b" }}>RADAR</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 rounded-lg transition-colors"
                style={{ textDecoration: "none" }}
                onMouseOver={(e) => { e.currentTarget.style.color = "#00a86b"; e.currentTarget.style.background = "#f0fdf4"; }}
                onMouseOut={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {/* Mobile menu — simplified */}
          <div className="md:hidden flex gap-2 overflow-x-auto">
            {NAV_LINKS.slice(0, 4).map((link) => (
              <Link key={link.href} href={link.href} className="text-xs text-gray-500 whitespace-nowrap" style={{ textDecoration: "none" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
