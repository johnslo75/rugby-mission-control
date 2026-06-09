import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const { rows } = await pool.query("SELECT * FROM performance ORDER BY date DESC");
  return NextResponse.json(rows.map((r) => ({
    id: r.id, date: r.date, platform: r.platform,
    hook: r.best_hook, views: r.views, likes: r.likes,
    followsGained: r.followers_gained, notes: r.notes,
  })));
}

export async function POST(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const body = await req.json();
  const id = Date.now().toString();
  await pool.query(`
    INSERT INTO performance (id, date, platform, best_hook, views, likes, followers_gained, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
  `, [id, body.date, body.platform, body.hook || "", body.views || 0, body.likes || 0, body.followsGained || 0, body.notes || ""]);
  return NextResponse.json({ ...body, id });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const body = await req.json();
  await pool.query(`
    UPDATE performance SET date=$2, platform=$3, best_hook=$4, views=$5, likes=$6, followers_gained=$7, notes=$8
    WHERE id=$1
  `, [body.id, body.date, body.platform, body.hook || "", body.views || 0, body.likes || 0, body.followsGained || 0, body.notes || ""]);
  return NextResponse.json(body);
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  await pool.query("DELETE FROM performance WHERE id=$1", [searchParams.get("id")]);
  return NextResponse.json({ ok: true });
}
