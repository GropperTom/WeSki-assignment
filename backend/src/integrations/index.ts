import { withQueryProviderCache } from "../cache/withQueryProviderCache.js";
import { externalAPI } from "./externalAPI/index.js";
import type { HotelSearchProvider, HotelSearchProviderRegistry } from "./types.js";

/**
 * Register a provider with the cache strategy that matches its search shape.
 * - externalAPI: group-size cache inside search (multiple upstream requests per query)
 * - default: full-query cache via withQueryProviderCache
 */
export function registerHotelSearchProvider(
  provider: HotelSearchProvider,
): HotelSearchProvider {
  if (provider.name === "externalAPI") {
    return provider;
  }

  return withQueryProviderCache(provider);
}

export const hotelSearchProviders: HotelSearchProviderRegistry = {
  externalAPI: registerHotelSearchProvider(externalAPI),
};

export type HotelSearchProviderName = keyof typeof hotelSearchProviders;

export function getHotelSearchProvider(name: HotelSearchProviderName) {
  return hotelSearchProviders[name];
}

export * from "./types.js";
export * from "./externalAPI/index.js";
