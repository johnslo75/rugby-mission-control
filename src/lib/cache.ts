// In-memory cache: stale-while-revalidate with stampede protection.
//
// - Fresh entry → returned immediately.
// - Expired entry → returned immediately as stale while ONE background
//   refresh runs; the next request gets the new data.
// - Failed refresh → last good value is kept and served, so a transient
//   DB or upstream error never blanks a page. Failures are logged.
// - Entries are never evicted; the key space is small and bounded.

interface CacheEntry<T> {
  data: T;
  updatedAt: number; // last successful fetch
  expiresAt: number;
}

export interface CacheResult<T> {
  data: T;
  updatedAt: number;
  stale: boolean;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function startFetch<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, updatedAt: Date.now(), expiresAt: Date.now() + ttlSeconds * 1000 });
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      const stale = store.get(key) as CacheEntry<T> | undefined;
      console.error(
        `[cache] fetch failed for "${key}"${stale ? " — serving stale data" : " — no stale data available"}:`,
        err instanceof Error ? err.message : err
      );
      if (stale) return stale.data;
      throw err;
    });
  inflight.set(key, promise);
  return promise;
}

export async function cachedMeta<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<CacheResult<T>> {
  const now = Date.now();
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (entry && entry.expiresAt > now) {
    return { data: entry.data, updatedAt: entry.updatedAt, stale: false };
  }

  if (entry) {
    // Serve stale immediately; refresh in the background (one fetch at a time).
    if (!inflight.has(key)) {
      startFetch(key, ttlSeconds, fetcher).catch(() => {}); // errors already logged in startFetch
    }
    return { data: entry.data, updatedAt: entry.updatedAt, stale: true };
  }

  // Nothing cached yet — wait for the fetch (or join the in-flight one).
  const data = (await (inflight.get(key) ?? startFetch(key, ttlSeconds, fetcher))) as T;
  const fresh = store.get(key) as CacheEntry<T> | undefined;
  return { data, updatedAt: fresh?.updatedAt ?? Date.now(), stale: false };
}

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  return (await cachedMeta(key, ttlSeconds, fetcher)).data;
}

export function invalidate(key: string) {
  store.delete(key);
  // Don't delete inflight — let it complete and repopulate
}

export function invalidateAll() {
  store.clear();
}
