import { notFound, permanentRedirect } from "next/navigation";
import { getAllStories } from "../components/utils";

export const dynamic = "force-dynamic";

// Legacy article URLs (rugbyradar.co/<slug>). This route used to render
// articles from a stale committed data/stories.json on disk — it now
// redirects to the canonical DB-backed article page.
export default async function LegacyArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stories = await getAllStories();
  if (!stories.some((s) => s.slug === slug)) notFound();
  permanentRedirect(`/article/${slug}`);
}
