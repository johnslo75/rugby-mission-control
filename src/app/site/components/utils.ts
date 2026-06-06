import pool from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { Story } from "../../api/stories/route";
import type { Score } from "../../api/scores/route";

export type { Score };

export const getWeekendScores = unstable_cache(
  async (): Promise<Score[]> => {
    try {
      const now = new Date();
      const from = new Date(now);
      from.setDate(now.getDate() - 3);
      const to = new Date(now);
      to.setDate(now.getDate() + 7);
      const { rows } = await pool.query(
        `SELECT * FROM scores
         WHERE match_date >= $1 AND match_date <= $2
           AND home_score IS NOT NULL
         ORDER BY competition, match_date`,
        [from.toISOString().slice(0, 10), to.toISOString().slice(0, 10)]
      );
      return rows.map((r) => ({
        id: r.id,
        competition: r.competition,
        homeTeam: r.home_team,
        awayTeam: r.away_team,
        homeScore: r.home_score,
        awayScore: r.away_score,
        matchDate: r.match_date,
        status: r.status,
        source: r.source,
      }));
    } catch {
      return [];
    }
  },
  ["weekend-scores"],
  { revalidate: 300 } // 5 minutes
);

const fetchAllStories = unstable_cache(
  async (): Promise<Story[]> => {
    const { rows } = await pool.query(
      "SELECT * FROM stories WHERE published=true ORDER BY date DESC"
    );
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      body: r.body,
      category: r.category,
      author: r.author,
      date: r.date,
      imageUrl: r.image_url || "",
      videoUrl: r.video_url || undefined,
      imageEmoji: r.image_emoji || "🏉",
      imageBg: r.image_bg || "#1a2a1a",
      featured: r.featured,
      viralScore: r.viral_score,
      matchInfo: r.match_info || undefined,
      published: r.published,
      tags: r.tags || [],
      competitions: r.competitions || [],
      isPriority: r.is_priority || false,
    }));
  },
  ["all-stories"],
  { revalidate: 300, tags: ["all-stories"] }
);

export async function getAllStories(): Promise<Story[]> {
  try {
    return await fetchAllStories();
  } catch {
    return [];
  }
}

export function readTime(body: string): number {
  const words = body.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((t.getTime() - now.getTime()) / 86400000));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
  });
}
