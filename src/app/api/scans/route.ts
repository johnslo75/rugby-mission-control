import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { ScanResult } from "../scan/route";

const FILE = path.join(process.cwd(), "data", "scans.json");

function read(): ScanResult[] {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}
function write(data: ScanResult[]) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const scans = read();
  // Return last 7 days
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return NextResponse.json(scans.filter((s) => new Date(s.timestamp).getTime() > cutoff));
}

// Update a scan (e.g. mark idea as saved/posted)
export async function PUT(req: NextRequest) {
  const body = (await req.json()) as { scanId: string; action: "save" | "post"; ideaKey: string };
  const scans = read();
  const scan = scans.find((s) => s.id === body.scanId);
  if (!scan) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (body.action === "save" && !scan.savedIdeas.includes(body.ideaKey)) {
    scan.savedIdeas.push(body.ideaKey);
  }
  if (body.action === "post" && !scan.postedIdeas.includes(body.ideaKey)) {
    scan.postedIdeas.push(body.ideaKey);
  }
  write(scans);
  return NextResponse.json(scan);
}
