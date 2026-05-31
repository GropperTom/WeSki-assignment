import { z } from "zod";

export const RESORT_IDS = [1, 2, 3, 4, 5] as const;

export const hotelSearchQuerySchema = z
  .object({
    resort: z.coerce
      .number()
      .int()
      .refine((id) => RESORT_IDS.includes(id as (typeof RESORT_IDS)[number]), {
        message: "Invalid resort",
      }),
    guests: z.coerce.number().int().min(1).max(10),
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date"),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date"),
  })
  .refine(({ start, end }) => end >= start, {
    message: "End date must be on or after start date",
    path: ["end"],
  });

export type HotelSearchQuery = z.infer<typeof hotelSearchQuerySchema>;

export const hotelSearchResponseSchema = z.object({
  hotels: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      rating: z.number(),
      price: z.number(),
      beds: z.number(),
      imageUrl: z.string().url().optional(),
    }),
  ),
});

export type HotelSearchResponse = z.infer<typeof hotelSearchResponseSchema>;

export function parseHotelSearchQuery(
  input: Record<string, unknown>,
): HotelSearchQuery {
  return hotelSearchQuerySchema.parse(input);
}
