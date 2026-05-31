import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏉</span>
              <span className="font-headline font-bold text-white text-lg">Rugby Shithousery</span>
            </div>
            <p className="text-sm leading-relaxed">
              Irish rugby opinion. Cynical play, referee management, professional fouls,
              and the hot takes nobody else will say.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Categories</h4>
            <ul className="space-y-2 text-sm">
              {["Ireland", "World Cup", "Shithousery", "Hot Takes", "Tactical", "Underdog"].map((cat) => (
                <li key={cat}>
                  <Link href={`/site/category/${cat.toLowerCase().replace(" ", "-")}`} className="hover:text-[#00C853] transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Follow Us</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://tiktok.com/@rugbyshithousery" target="_blank" rel="noopener noreferrer" className="hover:text-[#00C853] transition-colors">🎵 TikTok</a></li>
              <li><a href="https://instagram.com/rugbyshithousery" target="_blank" rel="noopener noreferrer" className="hover:text-[#00C853] transition-colors">📸 Instagram</a></li>
              <li><a href="https://x.com/rugbyshithousey" target="_blank" rel="noopener noreferrer" className="hover:text-[#00C853] transition-colors">🐦 Twitter/X</a></li>
              <li><a href="https://youtube.com/@rugbyshithousery" target="_blank" rel="noopener noreferrer" className="hover:text-[#00C853] transition-colors">▶️ YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {year} Rugby Shithousery. All rights reserved.</p>
          <p className="text-gray-600">Built with 🏉 and mild cynicism</p>
        </div>
      </div>
    </footer>
  );
}
