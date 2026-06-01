/**
 * Run once to:
 * 1. Create the users table
 * 2. Seed John (admin) and Jared (editor) with hashed passwords
 *
 * Usage:
 *   JOHN_PASSWORD=xxx JARED_PASSWORD=yyy node scripts/setup-auth.mjs
 */

import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log("Creating users table...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT UNIQUE NOT NULL,
      name          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'editor'
                    CHECK (role IN ('admin', 'editor', 'readonly')),
      active        BOOLEAN NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    )
  `);

  console.log("Users table ready.");

  const johnPassword = process.env.JOHN_PASSWORD;
  const jaredPassword = process.env.JARED_PASSWORD;

  if (!johnPassword || !jaredPassword) {
    console.error("ERROR: Set JOHN_PASSWORD and JARED_PASSWORD env vars before running.");
    process.exit(1);
  }

  const johnHash = await bcrypt.hash(johnPassword, 12);
  const jaredHash = await bcrypt.hash(jaredPassword, 12);

  await pool.query(`
    INSERT INTO users (email, name, password_hash, role)
    VALUES ($1, $2, $3, 'admin')
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role
  `, ["johnsloan1975@gmail.com", "John", johnHash]);

  console.log("✅ John (admin) upserted");

  await pool.query(`
    INSERT INTO users (email, name, password_hash, role)
    VALUES ($1, $2, $3, 'editor')
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role
  `, ["jaredsloan09@icloud.com", "Jared", jaredHash]);

  console.log("✅ Jared (editor) upserted");
  console.log("\nDone. Both users can now log in.");

  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
