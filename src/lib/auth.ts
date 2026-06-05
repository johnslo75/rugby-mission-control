import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "./db";
import { Pool } from "pg";

// Dedicated auth pool with a longer timeout — never shares connections
// with the main pool so a busy homepage can't block logins
const authPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("rlwy") ? { rejectUnauthorized: false } : false,
  max: 2,
  connectionTimeoutMillis: 15000,
  statement_timeout: 15000,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/hub/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Retry up to 3 times — DB can be slow on cold container start
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { rows } = await authPool.query(
              "SELECT * FROM users WHERE email = $1 AND active = true",
              [email]
            );
            const user = rows[0];
            if (!user) return null; // User not found — no point retrying

            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) return null; // Wrong password — no point retrying

            // Fire-and-forget last login update
            authPool.query(
              "UPDATE users SET last_login_at = NOW() WHERE id = $1",
              [user.id]
            ).catch(() => {});

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          } catch (err) {
            console.error(`Auth DB error (attempt ${attempt}/3):`, err);
            if (attempt < 3) {
              // Wait 500ms before retrying
              await new Promise((r) => setTimeout(r, 500));
            }
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
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
});
