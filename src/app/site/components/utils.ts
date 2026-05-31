import pool from "@/lib/db";
import type { Story } from "../../api/stories/route";

export async function getAllStories(): Promise<Story[]> {
  try {
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
    }));
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
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
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
