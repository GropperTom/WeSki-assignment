export function getHotelDedupKey(hotel: { beds: number; name: string }): string {
  return `${hotel.beds}-${hotel.name}`;
}
