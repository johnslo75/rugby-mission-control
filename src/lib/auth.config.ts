import type { NextAuthConfig } from "next-auth";

// Minimal edge-safe config — used by middleware to decode JWT only.
// No Node.js imports, no DB calls.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/hub/login",
  },
  providers: [],
  callbacks: {},
};
