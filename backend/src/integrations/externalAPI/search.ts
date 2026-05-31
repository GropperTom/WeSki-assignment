import type { HotelSearchQuery } from "../../schemas/hotelSearchSchema.js";
import type { HotelSearchOptions } from "../types.js";
import { fetchExternalAPI } from "./client.js";
import { getHotelDedupKey } from "./hotelKey.js";
import {
  getExternalAPIGuestCounts,
  parseExternalAPIRequest,
} from "./parseRequest.js";
import { parseExternalAPIResponse } from "./parseResponse.js";

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

      console.log(`[externalAPI] Request started (group_size=${groupSize})`);

      const requestBody = parseExternalAPIRequest(query, groupSize);
      const rawResponse = await fetchExternalAPI(requestBody, signal);

      if (signal?.aborted) {
        console.log(
          `[externalAPI] Request finished after abort (group_size=${groupSize})`,
        );
        return;
      }

      const { hotels } = parseExternalAPIResponse(rawResponse);
      const matchingHotels = hotels.filter((hotel) => hotel.beds === groupSize);
      const newHotels = matchingHotels.filter((hotel) => {
        const key = getHotelDedupKey(hotel);

        if (seenKeys.has(key)) {
          return false;
        }

        seenKeys.add(key);
        return true;
      });

      console.log(
        `[externalAPI] Request complete (group_size=${groupSize}): ${hotels.length} total, ${matchingHotels.length} with matching beds, ${newHotels.length} new after dedup`,
      );

      if (newHotels.length > 0) {
        allHotels.push(...newHotels);
        options?.onResult?.(newHotels, { groupSize });
      }
    }),
  );

  console.log(
    `[externalAPI] All requests finished: ${allHotels.length} unique hotel(s) across group_size=[${guestCounts.join(", ")}]`,
  );

  return { hotels: allHotels };
}
