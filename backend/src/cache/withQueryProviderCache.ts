import type { HotelSearchProvider } from "../integrations/types.js";
import {
  getCachedQueryProviderSearch,
  setCachedQueryProviderSearch,
} from "./providers/queryProviderCache.js";

/**
 * Wraps a provider that returns a single search result per query.
 * Providers with custom caching (e.g. externalAPI group-size requests) should not use this.
 */
export function withQueryProviderCache(
  provider: HotelSearchProvider,
): HotelSearchProvider {
  return {
    ...provider,
    search: async (query, signal, options) => {
      const cachedHotels = getCachedQueryProviderSearch(provider.name, query);

      if (cachedHotels !== undefined) {
        if (cachedHotels.length > 0) {
          options?.onResult?.(cachedHotels, {
            groupSize: query.guests,
            fromCache: true,
          });
        }

        return { hotels: cachedHotels };
      }

      const result = await provider.search(query, signal, options);

      if (!signal?.aborted) {
        setCachedQueryProviderSearch(provider.name, query, result.hotels);
      }

      return result;
    },
  };
}
