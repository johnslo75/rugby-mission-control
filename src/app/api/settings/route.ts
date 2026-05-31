import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "settings.json");

interface Settings {
  followers: number;
}

function read(): Settings {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}
function write(data: Settings) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(read());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Settings;
  write(body);
  return NextResponse.json(body);
}
