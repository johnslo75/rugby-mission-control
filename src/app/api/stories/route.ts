import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "stories.json");

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
  featured: boolean;
  published: boolean;
}

function read(): Story[] {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}
function write(data: Story[]) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");
  const all = searchParams.get("all");
  const allStories = read();
  const stories = all ? allStories : allStories.filter((s) => s.published);

  if (slug) return NextResponse.json(allStories.find((s) => s.slug === slug) ?? null);
  if (category) return NextResponse.json(stories.filter((s) => s.category.toLowerCase() === category.toLowerCase()));
  return NextResponse.json(stories);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<Story, "id" | "slug">;
  const stories = read();
  const story: Story = {
    ...body,
    id: Date.now().toString(),
    slug: slugify(body.title),
    published: true,
  };
  stories.unshift(story);
  write(stories);
  return NextResponse.json(story);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Story;
  const stories = read();
  const idx = stories.findIndex((s) => s.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  stories[idx] = body;
  write(stories);
  return NextResponse.json(body);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const stories = read().filter((s) => s.id !== id);
  write(stories);
  return NextResponse.json({ ok: true });
}
