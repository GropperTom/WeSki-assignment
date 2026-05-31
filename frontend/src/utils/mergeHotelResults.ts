import type { HotelResult } from '../hooks/useHotelSearch'
import type { Hotel } from '../schemas/hotelSearchStreamSchema'

export function getHotelDedupKey(hotel: { beds: number; name: string }): string {
  return `${hotel.beds}-${hotel.name}`
}

export function mergeHotelResults(
  current: HotelResult[],
  provider: string,
  incoming: Hotel[],
): HotelResult[] {
  const existingKeys = new Set(current.map(getHotelDedupKey))
  const newHotels: HotelResult[] = []

  for (const hotel of incoming) {
    const key = getHotelDedupKey(hotel)

    if (existingKeys.has(key)) {
      continue
    }

    existingKeys.add(key)
    newHotels.push({ ...hotel, provider })
  }

  if (newHotels.length === 0) {
    return current
  }

  return [...current, ...newHotels]
}
