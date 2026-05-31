import { z } from "zod";

export const externalAPIQuerySchema = z.object({
  ski_site: z.number().int(),
  from_date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid from_date format"),
  to_date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid to_date format"),
  group_size: z.number().int().min(1),
});

export const externalAPIRequestBodySchema = z.object({
  query: externalAPIQuerySchema,
});

export type ExternalAPIRequestBody = z.infer<typeof externalAPIRequestBodySchema>;

export const externalAPIImageSchema = z.object({
  URL: z.string().url(),
  MainImage: z.string().optional(),
});

export const externalAPIDistanceSchema = z.object({
  type: z.string(),
  distance: z.string(),
});

export const externalAPIAccommodationSchema = z.object({
  HotelCode: z.string(),
  HotelName: z.string(),
  HotelDescriptiveContent: z.object({
    Images: z.array(externalAPIImageSchema),
  }),
  HotelInfo: z.object({
    Position: z.object({
      Latitude: z.string(),
      Longitude: z.string(),
      Distances: z.array(externalAPIDistanceSchema),
    }),
    Rating: z.string(),
    Beds: z.string(),
  }),
  PricesInfo: z.object({
    AmountAfterTax: z.string(),
    AmountBeforeTax: z.string(),
  }),
});

export const externalAPIResponseBodySchema = z.object({
  success: z.string(),
  accommodations: z.array(externalAPIAccommodationSchema),
});

export const externalAPIResponseSchema = z.object({
  statusCode: z.number(),
  body: externalAPIResponseBodySchema,
});

export type ExternalAPIResponse = z.infer<typeof externalAPIResponseSchema>;
export type ExternalAPIAccommodation = z.infer<
  typeof externalAPIAccommodationSchema
>;
