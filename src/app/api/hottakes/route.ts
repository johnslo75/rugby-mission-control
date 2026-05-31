import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "hottakes.json");

interface HotTake {
  id: string;
  text: string;
  source: string;
  active: boolean;
  date: string;
}

export async function GET() {
  const takes: HotTake[] = JSON.parse(fs.readFileSync(FILE, "utf-8"));
  const active = takes.find((t) => t.active) ?? takes[0] ?? null;
  return NextResponse.json(active);
}
