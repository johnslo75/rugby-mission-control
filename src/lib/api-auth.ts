import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Guard for mutating API routes. The middleware only protects hub.* hostnames,
// so every handler that writes data must check the session itself —
// otherwise the same routes are wide open on the public domain.
export async function requireAuth(): Promise<NextResponse | null> {
  try {
    const session = await auth();
    if (session?.user) return null;
  } catch (err) {
    console.error("[api-auth] session check failed:", err);
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
