import type { HotelSearchResponse } from "../../../schemas/hotelSearchSchema.js";
import { createMemoryCache } from "../../createMemoryCache.js";

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 200;

const store = createMemoryCache<HotelSearchResponse["hotels"]>({
  provider: "externalAPI",
  maxEntries: MAX_ENTRIES,
  ttlMs: CACHE_TTL_MS,
});

export function getExternalAPIGroupCacheKey(
  resort: number,
  start: string,
  end: string,
  groupSize: number,
): string {
  return `group:${resort}:${start}:${end}:${groupSize}`;
}

export function getCachedExternalAPIGroupSearch(
  resort: number,
  start: string,
  end: string,
  groupSize: number,
): HotelSearchResponse["hotels"] | undefined {
  const key = getExternalAPIGroupCacheKey(resort, start, end, groupSize);
  return store.get(key);
}

export function setCachedExternalAPIGroupSearch(
  resort: number,
  start: string,
  end: string,
  groupSize: number,
  hotels: HotelSearchResponse["hotels"],
): void {
  const key = getExternalAPIGroupCacheKey(resort, start, end, groupSize);
  store.set(key, hotels);
}
