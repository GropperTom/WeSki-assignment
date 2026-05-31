import { externalAPI } from "./externalAPI/index.js";
import type { HotelSearchProviderRegistry } from "./types.js";

export const hotelSearchProviders: HotelSearchProviderRegistry = {
  externalAPI,
};

export type HotelSearchProviderName = keyof typeof hotelSearchProviders;

export function getHotelSearchProvider(name: HotelSearchProviderName) {
  return hotelSearchProviders[name];
}

export * from "./types.js";
export * from "./externalAPI/index.js";
