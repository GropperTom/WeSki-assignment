import type { HotelSearchQuery, HotelSearchResponse } from "../schemas/hotelSearchSchema.js";

export type HotelSearchProvider = {
  name: string;
  parseRequest: (query: HotelSearchQuery) => unknown;
  parseResponse: (raw: unknown) => HotelSearchResponse;
  search: (
    query: HotelSearchQuery,
    signal?: AbortSignal,
  ) => Promise<HotelSearchResponse>;
};

export type HotelSearchProviderRegistry = Record<string, HotelSearchProvider>;
