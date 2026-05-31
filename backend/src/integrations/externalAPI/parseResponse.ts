import { hotelSearchResponseSchema } from "../../schemas/hotelSearchSchema.js";
import type { HotelSearchResponse } from "../../schemas/hotelSearchSchema.js";
import { externalAPIResponseSchema, type ExternalAPIAccommodation } from "./types.js";

function getMainImageUrl(
  images: ExternalAPIAccommodation["HotelDescriptiveContent"]["Images"],
): string | undefined {
  return (
    images.find((image) => image.MainImage === "True")?.URL ?? images[0]?.URL
  );
}

function mapAccommodation(
  accommodation: ExternalAPIAccommodation,
): HotelSearchResponse["hotels"][number] {
  return {
    id: accommodation.HotelCode,
    name: accommodation.HotelName,
    rating: Number(accommodation.HotelInfo.Rating),
    price: Number(accommodation.PricesInfo.AmountAfterTax),
    beds: Number(accommodation.HotelInfo.Beds),
    imageUrl: getMainImageUrl(accommodation.HotelDescriptiveContent.Images),
  };
}

export function parseExternalAPIResponse(raw: unknown): HotelSearchResponse {
  const response = externalAPIResponseSchema.parse(raw);

  return hotelSearchResponseSchema.parse({
    hotels: response.body.accommodations.map(mapAccommodation),
  });
}
