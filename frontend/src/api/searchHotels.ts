import { hotelSearchQuerySchema, type HotelSearchQuery } from '../schemas/hotelSearchSchema'
import { hotelSearchStreamEventSchema } from '../schemas/hotelSearchStreamSchema'
import type { Hotel } from '../schemas/hotelSearchStreamSchema'
import type { SearchFilters } from '../types/searchFilters'

export function filtersToSearchQuery(filters: SearchFilters): HotelSearchQuery {
  return hotelSearchQuerySchema.parse({
    resort: filters.resortId,
    guests: filters.guests,
    start: filters.period?.start,
    end: filters.period?.end,
  })
}

export type StreamSearchHotelsCallbacks = {
  onProviderResult: (provider: string, hotels: Hotel[]) => void
  onProviderError: (provider: string, message: string) => void
  onDone: () => void
}

function buildSearchParams(query: HotelSearchQuery) {
  return new URLSearchParams({
    resort: String(query.resort),
    guests: String(query.guests),
    start: query.start,
    end: query.end,
  })
}

function parseSseChunk(chunk: string) {
  const dataLine = chunk
    .split('\n')
    .find((line) => line.startsWith('data: '))

  if (!dataLine) {
    return null
  }

  return hotelSearchStreamEventSchema.parse(
    JSON.parse(dataLine.slice('data: '.length)),
  )
}

export async function streamSearchHotels(
  query: HotelSearchQuery,
  callbacks: StreamSearchHotelsCallbacks,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `/api/hotels/search/stream?${buildSearchParams(query).toString()}`,
    { signal },
  )

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string
    } | null
    throw new Error(errorBody?.message ?? 'Failed to search hotels')
  }

  console.log('[hotel-search] Stream connected (HTTP 200), reading events')

  if (!response.body) {
    throw new Error('Streaming response is not supported')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let receivedDone = false

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel()
        console.log('[hotel-search] Stream aborted by client')
        return
      }

      const { done, value } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() ?? ''

      for (const chunk of chunks) {
        if (signal?.aborted) {
          return
        }

        const event = parseSseChunk(chunk)

        if (!event) {
          continue
        }

        if (event.type === 'provider_result') {
          console.log(
            `[hotel-search] Received ${event.hotels.length} hotels from ${event.provider}`,
          )
          callbacks.onProviderResult(event.provider, event.hotels)
        } else if (event.type === 'provider_error') {
          console.warn(
            `[hotel-search] Provider error from ${event.provider}:`,
            event.message,
          )
          callbacks.onProviderError(event.provider, event.message)
        } else if (event.type === 'done') {
          console.log('[hotel-search] Stream complete')
          receivedDone = true
          callbacks.onDone()
        }
      }
    }

    if (!signal?.aborted && !receivedDone) {
      throw new Error('Search stream ended unexpectedly')
    }
  } finally {
    reader.releaseLock()
  }
}
