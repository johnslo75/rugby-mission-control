import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";

  // Determine if this is a hub request
  const isHub =
    host.startsWith("hub.") ||
    host.includes("hub.rugbyshithousery") ||
    pathname.startsWith("/hub");

  // Only protect hub routes
  if (isHub) {
    const isLoginPage =
      pathname === "/hub/login" ||
      pathname === "/login" ||
      pathname.endsWith("/login");
    const isAuthApi = pathname.startsWith("/api/auth");

    if (!isLoginPage && !isAuthApi) {
      // Check session using NextAuth
      const session = await auth();
      if (!session) {
        const loginUrl = new URL("/hub/login", req.url);
        loginUrl.searchParams.set(
          "callbackUrl",
          pathname === "/" ? "/hub" : pathname
        );
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
