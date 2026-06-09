import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const { rows } = await pool.query("SELECT * FROM content_ideas ORDER BY created_at DESC");
  return NextResponse.json(rows.map((r) => ({
    id: r.id, title: r.title, hook: r.hook, script: r.script,
    caption: r.caption, tags: r.tags, category: r.category,
    status: r.status, source: r.source, viralScore: r.viral_score,
    date: r.created_at,
    // legacy fields for hub UI compatibility
    match: r.title, angle: r.hook, notes: r.caption,
  })));
}

export async function POST(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const body = await req.json();
  const id = Date.now().toString();
  await pool.query(`
    INSERT INTO content_ideas (id, title, hook, script, caption, tags, category, status, source, viral_score)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `, [
    id,
    body.title || body.match || "",
    body.hook || body.angle || "",
    body.script || "",
    body.caption || body.notes || "",
    body.tags || "",
    body.category || "",
    body.status || "idea",
    body.source || "",
    body.viralScore || null,
  ]);
  const { rows } = await pool.query("SELECT * FROM content_ideas WHERE id=$1", [id]);
  return NextResponse.json(rows[0]);
}

export async function PUT(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const body = await req.json();
  await pool.query(`
    UPDATE content_ideas SET
      title=$2, hook=$3, script=$4, caption=$5, tags=$6,
      category=$7, status=$8, source=$9, viral_score=$10, updated_at=NOW()
    WHERE id=$1
  `, [
    body.id,
    body.title || body.match || "",
    body.hook || body.angle || "",
    body.script || "",
    body.caption || body.notes || "",
    body.tags || "",
    body.category || "",
    body.status || "idea",
    body.source || "",
    body.viralScore || null,
  ]);
  return NextResponse.json(body);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await pool.query("DELETE FROM content_ideas WHERE id=$1", [id]);
  return NextResponse.json({ ok: true });
}
