// Simple in-memory cache for server-side data
// Prevents hitting the DB on every single page request

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (entry && entry.expiresAt > now) {
    return entry.data;
  }

  const data = await fetcher();
  store.set(key, { data, expiresAt: now + ttlSeconds * 1000 });
  return data;
}

export function invalidate(key: string) {
  store.delete(key);
}

export function invalidateAll() {
  store.clear();
}
