import { Suspense } from "react";
import fs from "fs";
import path from "path";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";
import { HeroCard, FeaturedCard, ListCard } from "./components/StoryCard";
import type { Story } from "../api/stories/route";

function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function getStories(): Story[] {
  try {
    const file = path.join(process.cwd(), "data", "stories.json");
    const all: Story[] = JSON.parse(fs.readFileSync(file, "utf-8"));
    return all.filter((s) => s.published).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export default function HomePage() {
  const stories = getStories();
  const hero = stories.find((s) => s.featured) || stories[0];
  const featured = stories.filter((s) => s.id !== hero?.id).slice(0, 3);
  const latest = stories.filter((s) => s.id !== hero?.id && !featured.find((f) => f.id === s.id)).slice(0, 10);
  const rwcDays = daysUntil(new Date("2027-10-01"));

  return (
    <>
      <SiteNav />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Hero */}
        {hero && (
          <section className="mb-12">
            <HeroCard story={hero} />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">

            {/* Featured grid */}
            {featured.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-headline text-xl font-bold text-gray-900">Featured</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {featured.map((story) => (
                    <FeaturedCard key={story.id} story={story} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest */}
            {latest.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-headline text-xl font-bold text-gray-900">Latest</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div>
                  {latest.map((story) => (
                    <ListCard key={story.id} story={story} />
                  ))}
                </div>
              </section>
            )}

            {stories.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🏉</p>
                <h2 className="font-headline text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                <p className="text-gray-500">Stories are on their way. Check back shortly.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* RWC Countdown */}
            <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#00C853] mb-2">Countdown</p>
              <p className="font-headline text-5xl font-bold text-white mb-1">{rwcDays}</p>
              <p className="text-sm text-gray-400">days to</p>
              <p className="font-headline text-lg font-bold mt-1">Rugby World Cup 2027</p>
              <p className="text-xs text-gray-500 mt-1">Australia · 1 October 2027</p>
            </div>

            {/* About */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-gray-900 mb-3">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Rugby Shithousery is an Irish rugby content channel covering the cynical, controversial, and
                brilliantly unsporting side of the game. The stuff the commentary team won&apos;t say.
              </p>
              <div className="flex gap-3">
                <a href="https://tiktok.com/@rugbyshithousery" target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  🎵 TikTok
                </a>
                <a href="https://instagram.com/rugbyshithousery" target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                  📸 Instagram
                </a>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {["Ireland", "World Cup", "Shithousery", "Hot Takes", "Tactical", "Underdog"].map((cat) => {
                  const count = stories.filter((s) => s.category === cat).length;
                  return (
                    <a
                      key={cat}
                      href={`/site/category/${cat.toLowerCase().replace(" ", "-")}`}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:text-[#00C853] transition-colors group"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#00C853]">{cat}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
