import type { HotelSearchQuery } from "../../schemas/hotelSearchSchema.js";
import type { HotelSearchProvider } from "../types.js";
import { fetchExternalAPI } from "./client.js";
import { parseExternalAPIRequest } from "./parseRequest.js";
import { parseExternalAPIResponse } from "./parseResponse.js";

async function searchExternalAPI(query: HotelSearchQuery) {
  const requestBody = parseExternalAPIRequest(query);
  const rawResponse = await fetchExternalAPI(requestBody);
  return parseExternalAPIResponse(rawResponse);
}

export const externalAPI: HotelSearchProvider = {
  name: "externalAPI",
  parseRequest: parseExternalAPIRequest,
  parseResponse: parseExternalAPIResponse,
  search: searchExternalAPI,
};

export * from "./client.js";
export * from "./parseRequest.js";
export * from "./parseResponse.js";
export * from "./types.js";
