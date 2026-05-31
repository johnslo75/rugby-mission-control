import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "checklist.json");

function read() {
  return JSON.parse(fs.readFileSync(FILE, "utf-8")) as ChecklistDay[];
}
function write(data: ChecklistDay[]) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

interface ChecklistDay {
  date: string;
  checked: Record<string, boolean>;
  savedAt: string;
}

export async function GET() {
  const data = read();
  const today = new Date().toISOString().slice(0, 10);
  const existing = data.find((d) => d.date === today);
  return NextResponse.json(existing ?? { date: today, checked: {}, savedAt: "" });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { date: string; checked: Record<string, boolean> };
  const data = read();
  const idx = data.findIndex((d) => d.date === body.date);
  const entry: ChecklistDay = { ...body, savedAt: new Date().toISOString() };
  if (idx >= 0) data[idx] = entry;
  else data.push(entry);
  write(data);
  return NextResponse.json(entry);
}
