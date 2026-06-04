// In-memory cache with stampede protection
// Only one DB fetch runs at a time — concurrent requests wait for it

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const entry = store.get(key) as CacheEntry<T> | undefined;

  // Return cached data if still fresh
  if (entry && entry.expiresAt > now) {
    return entry.data;
  }

  // If a fetch is already in-flight, wait for it instead of starting another
  if (inflight.has(key)) {
    return inflight.get(key) as Promise<T>;
  }

  // Start a new fetch
  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      // Return stale data if available rather than crashing
      const stale = store.get(key) as CacheEntry<T> | undefined;
      if (stale) return stale.data;
      throw err;
    });

  inflight.set(key, promise);
  return promise as Promise<T>;
}

export function invalidate(key: string) {
  store.delete(key);
  // Don't delete inflight — let it complete and repopulate
}

export function invalidateAll() {
  store.clear();
}
