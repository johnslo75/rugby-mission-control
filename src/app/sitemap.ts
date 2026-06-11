import type { MetadataRoute } from "next";
import pool from "@/lib/db";
import { COMPETITIONS } from "@/lib/competitions";

const BASE = "https://rugbyradar.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/site/latest`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/site/fixtures`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/site/womens`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/site/category/match-previews`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/site/competitions`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const competitions: MetadataRoute.Sitemap = COMPETITIONS.map((c) => ({
    url: `${BASE}/site/competitions/${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  let articles: MetadataRoute.Sitemap = [];
  try {
    const { rows } = await pool.query(
      "SELECT slug, date FROM stories WHERE published=true ORDER BY date DESC"
    );
    articles = rows.map((r) => ({
      url: `${BASE}/site/article/${r.slug}`,
      lastModified: new Date(r.date),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    // A DB blip shouldn't 500 the sitemap — serve the static pages
    console.error("[sitemap] story query failed:", err instanceof Error ? err.message : err);
  }

  return [...staticPages, ...competitions, ...articles];
}
