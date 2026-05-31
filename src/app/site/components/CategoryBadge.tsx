import Link from "next/link";

const CAT_CLASS: Record<string, string> = {
  shithousery: "cat-shithousery",
  ireland: "cat-ireland",
  tactical: "cat-tactical",
  "hot-takes": "cat-hot-takes",
  "hot takes": "cat-hot-takes",
  underdog: "cat-underdog",
  "world-cup": "cat-world-cup",
  "world cup": "cat-world-cup",
};

const CAT_LABELS: Record<string, string> = {
  shithousery: "Shithousery",
  ireland: "Ireland",
  tactical: "Tactical",
  "hot-takes": "Hot Takes",
  "hot takes": "Hot Takes",
  underdog: "Underdog",
  "world-cup": "World Cup",
  "world cup": "World Cup",
};

export default function CategoryBadge({ category, link = false }: { category?: string; link?: boolean }) {
  if (!category) return null;
  const key = category.toLowerCase();
  const cls = CAT_CLASS[key] || "cat-default";
  const label = CAT_LABELS[key] || category;
  const slug = key.replace(/ /g, "-");

  const badge = <span className={`cat-badge ${cls}`}>{label}</span>;
  if (link) return <Link href={`/site/category/${slug}`}>{badge}</Link>;
  return badge;
}
