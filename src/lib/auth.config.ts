import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Node.js imports (no pg, no bcrypt).
// Used by middleware to check JWT sessions without hitting the DB.
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/hub/login",
  },
  providers: [], // providers only needed in the full auth.ts
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      const isHub =
        request.headers.get("host")?.startsWith("hub.") ||
        request.headers.get("host")?.includes("hub.rugbyshithousery") ||
        pathname.startsWith("/hub");

      if (!isHub) return true; // public site — always allow

      const isLoginPage = pathname === "/hub/login" || pathname === "/login";
      const isAuthApi = pathname.startsWith("/api/auth");

      if (isLoginPage || isAuthApi) return true; // always allow login page

      return isLoggedIn; // everything else in hub requires login
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
