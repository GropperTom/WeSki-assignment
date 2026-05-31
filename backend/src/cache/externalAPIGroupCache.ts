import type { HotelSearchResponse } from "../schemas/hotelSearchSchema.js";

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 200;

type CacheEntry = {
  hotels: HotelSearchResponse["hotels"];
  expiresAt: number;
};

const entries = new Map<string, CacheEntry>();

export function getExternalAPIGroupCacheKey(
  resort: number,
  start: string,
  end: string,
  groupSize: number,
): string {
  return `externalAPI:${resort}:${start}:${end}:${groupSize}`;
}

export function getCachedExternalAPIGroupSearch(
  resort: number,
  start: string,
  end: string,
  groupSize: number,
): HotelSearchResponse["hotels"] | undefined {
  const key = getExternalAPIGroupCacheKey(resort, start, end, groupSize);
  const entry = entries.get(key);

  if (!entry) {
    console.log(
      `[cache] BE miss (provider=externalAPI, key=${key}, reason=not_found)`,
    );
    return undefined;
  }

  if (Date.now() > entry.expiresAt) {
    entries.delete(key);
    console.log(
      `[cache] BE miss (provider=externalAPI, key=${key}, reason=expired)`,
    );
    return undefined;
  }

  entries.delete(key);
  entries.set(key, entry);

  console.log(
    `[cache] BE hit (provider=externalAPI, key=${key}, hotels=${entry.hotels.length})`,
  );

  return entry.hotels;
}

export function setCachedExternalAPIGroupSearch(
  resort: number,
  start: string,
  end: string,
  groupSize: number,
  hotels: HotelSearchResponse["hotels"],
): void {
  const key = getExternalAPIGroupCacheKey(resort, start, end, groupSize);

  if (entries.has(key)) {
    entries.delete(key);
  } else if (entries.size >= MAX_ENTRIES) {
    const oldestKey = entries.keys().next().value;

    if (oldestKey !== undefined) {
      entries.delete(oldestKey);
    }
  }

  entries.set(key, {
    hotels,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  console.log(
    `[cache] BE stored (provider=externalAPI, key=${key}, hotels=${hotels.length})`,
  );
}
