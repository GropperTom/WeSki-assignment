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
): ExternalAPIRequestBody {
  const body = {
    query: {
      ski_site: query.resort,
      from_date: toExternalDateFormat(query.start),
      to_date: toExternalDateFormat(query.end),
      group_size: query.guests,
    },
  };

  return externalAPIRequestBodySchema.parse(body);
}
