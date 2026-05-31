import Link from "next/link";
import CategoryPill from "./CategoryPill";
import type { Story } from "../../api/stories/route";

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={`img-placeholder ${className || ""}`}>
      🏉
    </div>
  );
}

export function HeroCard({ story }: { story: Story }) {
  return (
    <Link href={`/site/${story.slug}`} className="group block">
      <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <ImagePlaceholder className="h-64 md:h-full min-h-[280px]" />
        <div className="p-8 flex flex-col justify-center bg-white">
          <div className="mb-4">
            <CategoryPill category={story.category} link />
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-[#00C853] transition-colors">
            {story.title}
          </h1>
          <p className="text-gray-500 leading-relaxed mb-6 text-sm">{story.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{story.author}</span>
            <span>·</span>
            <time>{new Date(story.date).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })}</time>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedCard({ story }: { story: Story }) {
  return (
    <Link href={`/site/${story.slug}`} className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <ImagePlaceholder className="h-48 w-full" />
      <div className="p-5">
        <CategoryPill category={story.category} link />
        <h2 className="font-headline text-lg font-bold text-gray-900 mt-3 mb-2 leading-snug group-hover:text-[#00C853] transition-colors line-clamp-3">
          {story.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{story.excerpt}</p>
        <time className="text-xs text-gray-400">
          {new Date(story.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
        </time>
      </div>
    </Link>
  );
}

export function ListCard({ story }: { story: Story }) {
  return (
    <Link href={`/site/${story.slug}`} className="group flex gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <CategoryPill category={story.category} link />
          <time className="text-xs text-gray-400">
            {new Date(story.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
          </time>
        </div>
        <h3 className="font-headline font-bold text-gray-900 leading-snug group-hover:text-[#00C853] transition-colors line-clamp-2">
          {story.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{story.excerpt}</p>
      </div>
      <ImagePlaceholder className="w-24 h-20 flex-shrink-0 rounded-lg" />
    </Link>
  );
}
