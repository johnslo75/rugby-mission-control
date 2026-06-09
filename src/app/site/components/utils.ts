import pool from "@/lib/db";
import { cached } from "@/lib/cache";
import { getFixtures } from "@/lib/fixtures";
import type { Story } from "../../api/stories/route";
import type { Score } from "../../api/scores/route";

export type { Score };

// Homepage scores widget — results only (with scores)
export async function getWeekendScores(): Promise<Score[]> {
  const { scores } = await getFixtures({ daysBack: 7, daysForward: 7, ttlSeconds: 300 });
  return scores
    .filter((s) => s.homeScore !== null)
    .sort((a, b) => (a.matchDate < b.matchDate ? 1 : -1));
}

// Fixtures page — all matches including upcoming
export async function getAllFixtures(): Promise<Score[]> {
  const { scores } = await getFixtures({ daysBack: 7, daysForward: 30, ttlSeconds: 300 });
  return scores;
}

// All published stories
export async function getAllStories(): Promise<Story[]> {
  return cached("all-stories", 300, async () => {
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
  }).catch(() => []);
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
