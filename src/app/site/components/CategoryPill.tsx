import Link from "next/link";

const CAT_STYLES: Record<string, string> = {
  ireland: "bg-emerald-600",
  "world cup": "bg-blue-700",
  shithousery: "bg-purple-700",
  "hot takes": "bg-red-600",
  tactical: "bg-amber-600",
  underdog: "bg-orange-600",
};

export default function CategoryPill({ category, link = false }: { category: string; link?: boolean }) {
  const slug = category.toLowerCase().replace(/ /g, "-");
  const color = CAT_STYLES[category.toLowerCase()] || "bg-gray-600";
  const pill = (
    <span className={`inline-block text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white ${color}`}>
      {category}
    </span>
  );
  if (link) return <Link href={`/site/category/${slug}`}>{pill}</Link>;
  return pill;
}
