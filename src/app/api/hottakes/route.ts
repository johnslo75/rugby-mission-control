import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM hottakes ORDER BY CASE WHEN active THEN 0 ELSE 1 END, date DESC LIMIT 1"
  );
  if (!rows[0]) return NextResponse.json(null);
  return NextResponse.json({ id: rows[0].id, text: rows[0].text, source: rows[0].source, active: rows[0].active, date: rows[0].date });
}
