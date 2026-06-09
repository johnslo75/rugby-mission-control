import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { invalidate } from "@/lib/cache";
import { revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/api-auth";

// Wrap any DB call with a hard 10s timeout
function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB timeout")), ms)
    ),
  ]);
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  videoUrl?: string;
  imageEmoji?: string;
  imageBg?: string;
  featured: boolean;
  viralScore?: number;
  matchInfo?: string;
  published: boolean;
  tags?: string[];
  // Competition taxonomy — array of competition slugs (e.g. ["six-nations", "urc"])
  competitions?: string[];
  // Priority flag — true for Irish rugby stories (mirrors Intelligence Engine isIrish flag)
  isPriority?: boolean;
}

function rowToStory(r: Record<string, unknown>): Story {
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    excerpt: r.excerpt as string,
    body: r.body as string,
    category: r.category as string,
    author: r.author as string,
    date: r.date as string,
    imageUrl: (r.image_url as string) || "",
    videoUrl: (r.video_url as string) || undefined,
    imageEmoji: (r.image_emoji as string) || "🏉",
    imageBg: (r.image_bg as string) || "#1a2a1a",
    featured: r.featured as boolean,
    viralScore: r.viral_score as number | undefined,
    matchInfo: (r.match_info as string) || undefined,
    published: r.published as boolean,
    tags: (r.tags as string[]) || [],
    competitions: (r.competitions as string[]) || [],
    isPriority: (r.is_priority as boolean) || false,
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");
  const all = searchParams.get("all");

  if (slug) {
    const { rows } = await pool.query("SELECT * FROM stories WHERE slug=$1", [slug]);
    return NextResponse.json(rows[0] ? rowToStory(rows[0]) : null);
  }
  if (category) {
    const { rows } = await pool.query(
      "SELECT * FROM stories WHERE published=true AND LOWER(category)=LOWER($1) ORDER BY date DESC",
      [category]
    );
    return NextResponse.json(rows.map(rowToStory));
  }
  const { rows } = all
    ? await pool.query("SELECT * FROM stories ORDER BY date DESC")
    : await pool.query("SELECT * FROM stories WHERE published=true ORDER BY date DESC");
  return NextResponse.json(rows.map(rowToStory));
}

export async function POST(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const body = (await req.json()) as Omit<Story, "id"> & { slug?: string };
    const id = Date.now().toString();
    const slug = body.slug ? body.slug : slugify(body.title);
    await withTimeout(pool.query(`
      INSERT INTO stories (id, slug, title, excerpt, body, category, author, date,
        image_url, video_url, image_emoji, image_bg, featured, viral_score, match_info, published, tags, competitions, is_priority)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    `, [
      id, slug, body.title, body.excerpt, body.body, body.category, body.author, body.date,
      body.imageUrl || '', body.videoUrl || '', body.imageEmoji || '🏉', body.imageBg || '#1a2a1a',
      body.featured || false, body.viralScore || null, body.matchInfo || null,
      true, body.tags || [], body.competitions || [], body.isPriority || false,
    ]));
    const { rows } = await pool.query("SELECT * FROM stories WHERE id=$1", [id]);
    invalidate("all-stories"); revalidateTag("all-stories", "");
    return NextResponse.json(rowToStory(rows[0]));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    const body = (await req.json()) as Story;
    await withTimeout(pool.query(`
      UPDATE stories SET
        title=$2, excerpt=$3, body=$4, category=$5, author=$6, date=$7,
        image_url=$8, video_url=$9, image_emoji=$10, image_bg=$11,
        featured=$12, viral_score=$13, match_info=$14, published=$15, tags=$16,
        competitions=$17, is_priority=$18
      WHERE id=$1
    `, [
      body.id, body.title, body.excerpt, body.body, body.category, body.author, body.date,
      body.imageUrl || '', body.videoUrl || '', body.imageEmoji || '🏉', body.imageBg || '#1a2a1a',
      body.featured || false, body.viralScore || null, body.matchInfo || null,
      body.published || false, body.tags || [],
      body.competitions || [], body.isPriority || false,
    ]));
    invalidate("all-stories"); revalidateTag("all-stories", "");
    return NextResponse.json(body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await pool.query("DELETE FROM stories WHERE id=$1", [id]);
  invalidate("all-stories"); revalidateTag("all-stories", "");
  return NextResponse.json({ ok: true });
}
