import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Node.js imports (no pg, no bcrypt).
// Used by middleware only to check JWT sessions.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/hub/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const host = request.headers.get("host") || "";

      const isHub =
        host.startsWith("hub.") ||
        host.includes("hub.rugbyshithousery") ||
        pathname.startsWith("/hub");

      if (!isHub) return true;

      const isLoginPage = pathname === "/hub/login" || pathname === "/login";
      const isAuthApi = pathname.startsWith("/api/auth");
      if (isLoginPage || isAuthApi) return true;

      return !!auth?.user;
    },
  },
};
