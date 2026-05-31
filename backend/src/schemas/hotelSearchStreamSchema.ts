import { z } from "zod";
import { hotelSearchResponseSchema } from "./hotelSearchSchema.js";

export const hotelSchema = hotelSearchResponseSchema.shape.hotels.element;

export const providerResultEventSchema = z.object({
  type: z.literal("provider_result"),
  provider: z.string(),
  hotels: hotelSearchResponseSchema.shape.hotels,
});

export const providerErrorEventSchema = z.object({
  type: z.literal("provider_error"),
  provider: z.string(),
  message: z.string(),
});

export const searchDoneEventSchema = z.object({
  type: z.literal("done"),
});

export const hotelSearchStreamEventSchema = z.discriminatedUnion("type", [
  providerResultEventSchema,
  providerErrorEventSchema,
  searchDoneEventSchema,
]);

export type Hotel = z.infer<typeof hotelSchema>;
export type HotelSearchStreamEvent = z.infer<typeof hotelSearchStreamEventSchema>;
