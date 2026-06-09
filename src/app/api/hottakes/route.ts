import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM hottakes ORDER BY CASE WHEN active THEN 0 ELSE 1 END, date DESC"
  );
  return NextResponse.json(rows.map((r) => ({
    id: r.id, text: r.text, source: r.source, active: r.active, date: r.date,
  })));
}

export async function POST(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { text, source } = await req.json() as { text: string; source: string };
  const id = Date.now().toString();
  await pool.query(
    "INSERT INTO hottakes (id, text, source, active, date) VALUES ($1, $2, $3, false, $4)",
    [id, text, source, new Date().toISOString().slice(0, 10)]
  );
  return NextResponse.json({ id, text, source, active: false });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id, text, source, active } = await req.json() as { id: string; text: string; source: string; active: boolean };
  // If activating this one, deactivate all others first
  if (active) await pool.query("UPDATE hottakes SET active = false");
  await pool.query(
    "UPDATE hottakes SET text=$2, source=$3, active=$4 WHERE id=$1",
    [id, text, source, active]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get("id");
  await pool.query("DELETE FROM hottakes WHERE id=$1", [id]);
  return NextResponse.json({ ok: true });
}
