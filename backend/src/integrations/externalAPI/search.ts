import type {
  HotelSearchQuery,
  HotelSearchResponse,
} from "../../schemas/hotelSearchSchema.js";
import {
  getCachedExternalAPIGroupSearch,
  setCachedExternalAPIGroupSearch,
} from "../../cache/externalAPIGroupCache.js";
import type { HotelSearchOptions } from "../types.js";
import { fetchExternalAPI } from "./client.js";
import { getHotelDedupKey } from "./hotelKey.js";
import {
  getExternalAPIGuestCounts,
  parseExternalAPIRequest,
} from "./parseRequest.js";
import { parseExternalAPIResponse } from "./parseResponse.js";

async function fetchGroupSizeHotels(
  query: HotelSearchQuery,
  groupSize: number,
  signal?: AbortSignal,
): Promise<{ hotels: HotelSearchResponse["hotels"]; fromCache: boolean }> {
  const cachedHotels = getCachedExternalAPIGroupSearch(
    query.resort,
    query.start,
    query.end,
    groupSize,
  );

  if (cachedHotels !== undefined) {
    console.log(
      `[externalAPI] Using cached results (group_size=${groupSize})`,
    );
    return { hotels: cachedHotels, fromCache: true };
  }

  console.log(`[externalAPI] Request started (group_size=${groupSize})`);

  const requestBody = parseExternalAPIRequest(query, groupSize);
  const rawResponse = await fetchExternalAPI(requestBody, signal);

  if (signal?.aborted) {
    console.log(
      `[externalAPI] Request finished after abort (group_size=${groupSize})`,
    );
    return { hotels: [], fromCache: false };
  }

  const { hotels } = parseExternalAPIResponse(rawResponse);
  const matchingHotels = hotels.filter((hotel) => hotel.beds === groupSize);

  if (!signal?.aborted) {
    setCachedExternalAPIGroupSearch(
      query.resort,
      query.start,
      query.end,
      groupSize,
      matchingHotels,
    );
  }

  return { hotels: matchingHotels, fromCache: false };
}

export async function searchExternalAPI(
  query: HotelSearchQuery,
  signal?: AbortSignal,
  options?: HotelSearchOptions,
) {
  const guestCounts = getExternalAPIGuestCounts(query.guests);
  const seenKeys = new Set<string>();
  const allHotels: ReturnType<typeof parseExternalAPIResponse>["hotels"] = [];

  console.log(
    `[externalAPI] Starting ${guestCounts.length} parallel request(s) for group_size=[${guestCounts.join(", ")}]`,
    { resort: query.resort, start: query.start, end: query.end },
  );

  await Promise.all(
    guestCounts.map(async (groupSize) => {
      if (signal?.aborted) {
        console.log(
          `[externalAPI] Skipping request (group_size=${groupSize}): search aborted`,
        );
        return;
      }

      console.log(`[externalAPI] Resolving group_size=${groupSize}`);

      const { hotels: matchingHotels, fromCache } = await fetchGroupSizeHotels(
        query,
        groupSize,
        signal,
      );

      if (signal?.aborted) {
        return;
      }

      const newHotels = matchingHotels.filter((hotel) => {
        const key = getHotelDedupKey(hotel);

        if (seenKeys.has(key)) {
          return false;
        }

        seenKeys.add(key);
        return true;
      });

      console.log(
        `[externalAPI] Request complete (group_size=${groupSize}, cache=${fromCache ? "hit" : "miss"}): ${matchingHotels.length} matching beds, ${newHotels.length} new after dedup`,
      );

      if (newHotels.length > 0) {
        allHotels.push(...newHotels);
        options?.onResult?.(newHotels, { groupSize, fromCache });
      }
    }),
  );

  console.log(
    `[externalAPI] All requests finished: ${allHotels.length} unique hotel(s) across group_size=[${guestCounts.join(", ")}]`,
  );

  return { hotels: allHotels };
}
