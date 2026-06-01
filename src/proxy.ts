import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  // Skip static files
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const isHub =
    host.startsWith("hub.") ||
    host.includes("hub.rugbyshithousery") ||
    pathname.startsWith("/hub");

  // ── AUTH GUARD ────────────────────────────────────────────────
  // Protect all hub routes except /hub/login and NextAuth API routes
  if (isHub) {
    const isLoginPage = pathname === "/hub/login" || pathname === "/login";
    const isAuthApi = pathname.startsWith("/api/auth");

    if (!isLoginPage && !isAuthApi) {
      const session = await auth();
      if (!session) {
        const loginUrl = req.nextUrl.clone();
        // On the hub subdomain the path is "/" but we need to send to /hub/login
        loginUrl.pathname = "/hub/login";
        loginUrl.searchParams.set("callbackUrl", pathname === "/" ? "/hub" : pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }
  // ─────────────────────────────────────────────────────────────

  // Skip API routes after auth check (don't rewrite them)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Already routed correctly
  if (isHub && pathname.startsWith("/hub")) return NextResponse.next();
  if (!isHub && pathname.startsWith("/site")) return NextResponse.next();

  if (isHub) {
    // hub.rugbyshithousery.com/foo → /hub/foo
    const url = req.nextUrl.clone();
    url.pathname = `/hub${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  } else {
    // rugbyshithousery.com/foo → /site/foo
    const url = req.nextUrl.clone();
    url.pathname = `/site${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
