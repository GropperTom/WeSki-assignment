import type { HotelSearchQuery, HotelSearchResponse } from "../schemas/hotelSearchSchema.js";

export type HotelSearchProvider = {
  name: string;
  parseRequest: (query: HotelSearchQuery) => unknown;
  parseResponse: (raw: unknown) => HotelSearchResponse;
  search: (query: HotelSearchQuery) => Promise<HotelSearchResponse>;
};

export type HotelSearchProviderRegistry = Record<string, HotelSearchProvider>;
