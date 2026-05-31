import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query("SELECT key, value FROM settings");
  const settings: Record<string, unknown> = {};
  for (const r of rows) {
    settings[r.key] = isNaN(Number(r.value)) ? r.value : Number(r.value);
  }
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await pool.query(`
      INSERT INTO settings (key, value) VALUES ($1,$2)
      ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value
    `, [key, String(value)]);
  }
  return NextResponse.json(body);
}
