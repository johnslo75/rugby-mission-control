import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe auth middleware.
// The `authorized` callback in authConfig handles the redirect logic.
// Subdomain routing is handled by Railway + the root page.tsx fallback.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
