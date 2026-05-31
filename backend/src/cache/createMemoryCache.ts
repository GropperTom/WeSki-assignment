export type MemoryCacheOptions = {
  provider: string;
  maxEntries: number;
  ttlMs: number;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export function createMemoryCache<T>(options: MemoryCacheOptions) {
  const { provider, maxEntries, ttlMs } = options;
  const entries = new Map<string, CacheEntry<T>>();

  function get(key: string): T | undefined {
    const entry = entries.get(key);

    if (!entry) {
      console.log(
        `[cache] BE miss (provider=${provider}, key=${key}, reason=not_found)`,
      );
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      entries.delete(key);
      console.log(
        `[cache] BE miss (provider=${provider}, key=${key}, reason=expired)`,
      );
      return undefined;
    }

    entries.delete(key);
    entries.set(key, entry);

    console.log(`[cache] BE hit (provider=${provider}, key=${key})`);

    return entry.value;
  }

  function set(key: string, value: T): void {
    if (entries.has(key)) {
      entries.delete(key);
    } else if (entries.size >= maxEntries) {
      const oldestKey = entries.keys().next().value;

      if (oldestKey !== undefined) {
        entries.delete(oldestKey);
      }
    }

    entries.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });

    console.log(`[cache] BE stored (provider=${provider}, key=${key})`);
  }

  return { get, set };
}
