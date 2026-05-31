import type { HotelSearchQuery, HotelSearchResponse } from "../schemas/hotelSearchSchema.js";

export type HotelSearchResultMeta = {
  groupSize: number;
};

export type HotelSearchOptions = {
  onResult?: (
    hotels: HotelSearchResponse["hotels"],
    meta: HotelSearchResultMeta,
  ) => void;
};

export type HotelSearchProvider = {
  name: string;
  parseRequest: (query: HotelSearchQuery) => unknown;
  parseResponse: (raw: unknown) => HotelSearchResponse;
  search: (
    query: HotelSearchQuery,
    signal?: AbortSignal,
    options?: HotelSearchOptions,
  ) => Promise<HotelSearchResponse>;
};

export type HotelSearchProviderRegistry = Record<string, HotelSearchProvider>;
