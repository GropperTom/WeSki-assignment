import type { HotelSearchQuery } from "../../schemas/hotelSearchSchema.js";
import {
  externalAPIRequestBodySchema,
  type ExternalAPIRequestBody,
} from "./types.js";

function toExternalDateFormat(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

export function parseExternalAPIRequest(
  query: HotelSearchQuery,
  groupSize: number = query.guests,
): ExternalAPIRequestBody {
  const body = {
    query: {
      ski_site: query.resort,
      from_date: toExternalDateFormat(query.start),
      to_date: toExternalDateFormat(query.end),
      group_size: groupSize,
    },
  };

  return externalAPIRequestBodySchema.parse(body);
}

export function getExternalAPIGuestCounts(minGuests: number): number[] {
  const firstGuestCount = Math.min(Math.max(minGuests, 1), 10);
  return Array.from(
    { length: 10 - firstGuestCount + 1 },
    (_, index) => firstGuestCount + index,
  );
}
