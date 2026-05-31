import type { Hotel } from '../schemas/hotelSearchStreamSchema'
import type { HotelSearchQuery } from '../schemas/hotelSearchSchema'

type HotelResult = Hotel & { provider: string }

type ProviderSearchError = {
  provider: string
  message: string
}

const CACHE_TTL_MS = 10 * 60 * 1000
const MAX_ENTRIES = 20

type CacheEntry = {
  hotels: HotelResult[]
  providerErrors: ProviderSearchError[]
  expiresAt: number
}

const entries = new Map<string, CacheEntry>()

export function getHotelSearchQueryKey(query: HotelSearchQuery): string {
  return `${query.resort}:${query.start}:${query.end}:${query.guests}`
}

export function getCachedHotelSearch(
  query: HotelSearchQuery,
): Pick<CacheEntry, 'hotels' | 'providerErrors'> | undefined {
  const key = getHotelSearchQueryKey(query)
  const entry = entries.get(key)

  if (!entry) {
    console.log(`[cache] FE miss (key=${key}, reason=not_found)`)
    return undefined
  }

  if (Date.now() > entry.expiresAt) {
    entries.delete(key)
    console.log(`[cache] FE miss (key=${key}, reason=expired)`)
    return undefined
  }

  entries.delete(key)
  entries.set(key, entry)

  console.log(
    `[cache] FE hit (key=${key}, hotels=${entry.hotels.length}, providerErrors=${entry.providerErrors.length})`,
  )

  return {
    hotels: entry.hotels,
    providerErrors: entry.providerErrors,
  }
}

export function setCachedHotelSearch(
  query: HotelSearchQuery,
  result: Pick<CacheEntry, 'hotels' | 'providerErrors'>,
): void {
  const key = getHotelSearchQueryKey(query)

  if (entries.has(key)) {
    entries.delete(key)
  } else if (entries.size >= MAX_ENTRIES) {
    const oldestKey = entries.keys().next().value

    if (oldestKey !== undefined) {
      entries.delete(oldestKey)
    }
  }

  entries.set(key, {
    hotels: result.hotels,
    providerErrors: result.providerErrors,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  console.log(
    `[cache] FE stored (key=${key}, hotels=${result.hotels.length}, providerErrors=${result.providerErrors.length})`,
  )
}
