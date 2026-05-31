import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "content.json");

interface ContentEntry {
  id: string;
  date: string;
  match: string;
  angle: string;
  hook: string;
  status: "idea" | "in production" | "posted";
  notes: string;
}

function read(): ContentEntry[] {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}
function write(data: ContentEntry[]) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(read());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<ContentEntry, "id">;
  const data = read();
  const entry: ContentEntry = { ...body, id: Date.now().toString() };
  data.push(entry);
  write(data);
  return NextResponse.json(entry);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as ContentEntry;
  const data = read();
  const idx = data.findIndex((e) => e.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  data[idx] = body;
  write(data);
  return NextResponse.json(body);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const data = read().filter((e) => e.id !== id);
  write(data);
  return NextResponse.json({ ok: true });
}
