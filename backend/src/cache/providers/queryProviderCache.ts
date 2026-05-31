import type {
  HotelSearchQuery,
  HotelSearchResponse,
} from "../../schemas/hotelSearchSchema.js";
import { createMemoryCache } from "../createMemoryCache.js";

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 100;

const stores = new Map<
  string,
  ReturnType<typeof createMemoryCache<HotelSearchResponse["hotels"]>>
>();

function getStore(providerName: string) {
  let store = stores.get(providerName);

  if (!store) {
    store = createMemoryCache<HotelSearchResponse["hotels"]>({
      provider: providerName,
      maxEntries: MAX_ENTRIES,
      ttlMs: CACHE_TTL_MS,
    });
    stores.set(providerName, store);
  }

  return store;
}

export function getQueryProviderCacheKey(query: HotelSearchQuery): string {
  return `query:${query.resort}:${query.start}:${query.end}:${query.guests}`;
}

export function getCachedQueryProviderSearch(
  providerName: string,
  query: HotelSearchQuery,
): HotelSearchResponse["hotels"] | undefined {
  const key = getQueryProviderCacheKey(query);
  return getStore(providerName).get(key);
}

export function setCachedQueryProviderSearch(
  providerName: string,
  query: HotelSearchQuery,
  hotels: HotelSearchResponse["hotels"],
): void {
  const key = getQueryProviderCacheKey(query);
  getStore(providerName).set(key, hotels);
}
