import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import CategoryPill from "../components/CategoryPill";
import { ListCard } from "../components/StoryCard";
import type { Story } from "../../api/stories/route";

function getStories(): Story[] {
  try {
    const file = path.join(process.cwd(), "data", "stories.json");
    return (JSON.parse(fs.readFileSync(file, "utf-8")) as Story[])
      .filter((s) => s.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return getStories().map((s) => ({ slug: s.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const stories = getStories();
  const story = stories.find((s) => s.slug === params.slug);
  if (!story) notFound();

  const related = stories.filter((s) => s.id !== story.id && s.category === story.category).slice(0, 3);
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://rugbyshithousery.com"}/${story.slug}`;
  const shareText = encodeURIComponent(story.title);

  return (
    <>
      <SiteNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
              <Link href="/site" className="hover:text-[#00C853]">Home</Link>
              <span>/</span>
              <Link href={`/site/category/${story.category.toLowerCase().replace(" ", "-")}`} className="hover:text-[#00C853]">{story.category}</Link>
              <span>/</span>
              <span className="text-gray-600 truncate">{story.title.slice(0, 40)}…</span>
            </nav>

            {/* Header */}
            <header className="mb-8">
              <CategoryPill category={story.category} link />
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-4 mb-4">
                {story.title}
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-6">{story.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-200">
                <span className="font-medium text-gray-600">{story.author}</span>
                <span>·</span>
                <time>{new Date(story.date).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time>
              </div>
            </header>

            {/* Image */}
            <div className="img-placeholder h-72 w-full rounded-2xl mb-8 text-5xl">🏉</div>

            {/* Body */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: story.body }}
            />

            {/* Share */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Share this</p>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🐦 Share on X
                </a>
                <a
                  href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  💬 WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-headline text-xl font-bold text-gray-900">More in {story.category}</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                {related.map((s) => <ListCard key={s.id} story={s} />)}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:pt-10">
            <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#00C853] mb-3">Follow Rugby Shithousery</p>
              <div className="space-y-2">
                <a href="https://tiktok.com/@rugbyshithousery" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg py-2.5 text-sm transition-colors">
                  🎵 TikTok
                </a>
                <a href="https://instagram.com/rugbyshithousery" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg py-2.5 text-sm transition-colors">
                  📸 Instagram
                </a>
                <a href="https://x.com/rugbyshithousery" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg py-2.5 text-sm transition-colors">
                  🐦 Twitter/X
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
