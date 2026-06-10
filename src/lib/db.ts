import { Pool } from "pg";

let pool: Pool | null = null;
let consecutiveConnectTimeouts = 0;

// After this many connect timeouts in a row, assume the pool is wedged
// (stale sockets, broken private-network DNS, etc.) and rebuild it.
const POOL_RESET_THRESHOLD = 3;

function createPool(): Pool {
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("rlwy")
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 5000,
    keepAlive: true,
    // Recycle connections so a dead-but-not-closed socket can't live forever
    maxLifetimeSeconds: 300,
  });
  p.on("error", (err) => {
    console.error("[db] idle client error:", err.message);
  });
  return p;
}

function getPool(): Pool {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

function resetPool(reason: string) {
  console.error(`[db] resetting connection pool: ${reason}`);
  const old = pool;
  pool = null;
  consecutiveConnectTimeouts = 0;
  old?.end().catch((err) =>
    console.error("[db] error closing old pool:", err.message),
  );
}

function isConnectTimeout(err: unknown): boolean {
  return (
    err instanceof Error &&
    err.message.includes("timeout exceeded when trying to connect")
  );
}

async function query(...args: unknown[]): Promise<unknown> {
  const p = getPool();
  try {
    const result = await (
      p.query as unknown as (...a: unknown[]) => Promise<unknown>
    )(...args);
    consecutiveConnectTimeouts = 0;
    return result;
  } catch (err) {
    if (isConnectTimeout(err)) {
      consecutiveConnectTimeouts++;
      // `pool === p` guard: parallel failures from the same wedged pool
      // must only trigger one rebuild
      if (consecutiveConnectTimeouts >= POOL_RESET_THRESHOLD && pool === p) {
        resetPool(
          `${consecutiveConnectTimeouts} consecutive connection timeouts`,
        );
      }
    }
    throw err;
  }
}

// Proxy so existing `pool.query(...)` calls work unchanged
export default new Proxy({} as Pool, {
  get(_target, prop) {
    if (prop === "query") {
      return query;
    }
    const p = getPool();
    const value = (p as unknown as Record<string | symbol, unknown>)[prop];
    // Bind so Pool internals never run with `this` pointing at the proxy
    return typeof value === "function" ? value.bind(p) : value;
  },
});
