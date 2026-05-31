import fs from "fs";
import path from "path";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import { FeaturedCard, ListCard } from "../../components/StoryCard";
import type { Story } from "../../../api/stories/route";

const CATEGORY_MAP: Record<string, string> = {
  ireland: "Ireland",
  "world-cup": "World Cup",
  shithousery: "Shithousery",
  "hot-takes": "Hot Takes",
  tactical: "Tactical",
  underdog: "Underdog",
};

function getStoriesByCategory(cat: string): Story[] {
  try {
    const file = path.join(process.cwd(), "data", "stories.json");
    const all: Story[] = JSON.parse(fs.readFileSync(file, "utf-8"));
    const label = CATEGORY_MAP[cat] || cat;
    return all
      .filter((s) => s.published && s.category.toLowerCase() === label.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((cat) => ({ cat }));
}

export default function CategoryPage({ params }: { params: { cat: string } }) {
  const stories = getStoriesByCategory(params.cat);
  const label = CATEGORY_MAP[params.cat] || params.cat;

  return (
    <>
      <SiteNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-10 pb-6 border-b-2 border-[#00C853]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00C853] mb-2">Category</p>
          <h1 className="font-headline text-4xl font-bold text-gray-900">{label}</h1>
          <p className="text-gray-500 mt-2">{stories.length} article{stories.length !== 1 ? "s" : ""}</p>
        </header>

        {stories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏉</p>
            <p className="text-gray-500">No stories in this category yet.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {stories.slice(0, 3).map((story) => (
                <FeaturedCard key={story.id} story={story} />
              ))}
            </div>
            {stories.length > 3 && (
              <div>
                {stories.slice(3).map((story) => (
                  <ListCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
