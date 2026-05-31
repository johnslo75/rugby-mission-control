import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  // Skip API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const isHub =
    host.startsWith("hub.") ||
    host.includes("hub.rugbyshithousery") ||
    pathname.startsWith("/hub");

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
