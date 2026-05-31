import type { HotelSearchProvider } from "../types.js";
import { parseExternalAPIRequest } from "./parseRequest.js";
import { parseExternalAPIResponse } from "./parseResponse.js";
import { searchExternalAPI } from "./search.js";

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
