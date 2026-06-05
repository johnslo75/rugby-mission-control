import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("railway") || process.env.DATABASE_URL?.includes("rlwy")
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
      statement_timeout: 10000,
    });
  }
  return pool;
}

// Proxy so existing `pool.query(...)` calls work unchanged
export default new Proxy({} as Pool, {
  get(_target, prop) {
    return (getPool() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
