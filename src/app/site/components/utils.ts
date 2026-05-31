import fs from "fs";
import path from "path";
import type { Story } from "../../api/stories/route";

export function getAllStories(): Story[] {
  try {
    const file = path.join(process.cwd(), "data", "stories.json");
    return (JSON.parse(fs.readFileSync(file, "utf-8")) as Story[])
      .filter((s) => s.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
