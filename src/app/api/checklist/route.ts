import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query("SELECT * FROM checklist WHERE date=$1", [today]);
  if (rows[0]) {
    return NextResponse.json({ date: rows[0].date, checked: rows[0].checked, savedAt: rows[0].saved_at });
  }
  return NextResponse.json({ date: today, checked: {}, savedAt: "" });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { date: string; checked: Record<string, boolean> };
  await pool.query(`
    INSERT INTO checklist (date, checked, saved_at) VALUES ($1,$2,NOW())
    ON CONFLICT (date) DO UPDATE SET checked=EXCLUDED.checked, saved_at=NOW()
  `, [body.date, JSON.stringify(body.checked)]);
  const { rows } = await pool.query("SELECT * FROM checklist WHERE date=$1", [body.date]);
  return NextResponse.json({ date: rows[0].date, checked: rows[0].checked, savedAt: rows[0].saved_at });
}
