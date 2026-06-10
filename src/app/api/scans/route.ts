import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { rows } = await pool.query(
    "SELECT * FROM scans WHERE created_at > $1 ORDER BY created_at DESC",
    [cutoff]
  );
  return NextResponse.json(rows.map((r) => ({
    id: r.id,
    date: r.date,
    timestamp: r.created_at,
    stories: r.stories,
    ideas: r.ideas,
    rawItems: r.raw_items,
    savedIdeas: [],
    postedIdeas: [],
  })));
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as { scanId: string; action: "save" | "post"; ideaKey: string };
  // For now, action tracking is handled in content_ideas — just return ok
  return NextResponse.json({ ok: true, ...body });
}
