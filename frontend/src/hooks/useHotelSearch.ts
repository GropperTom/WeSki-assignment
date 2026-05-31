import { useCallback, useEffect, useRef, useState } from 'react'
import { ZodError } from 'zod'
import { filtersToSearchQuery, streamSearchHotels } from '../api/searchHotels'
import {
  getCachedHotelSearch,
  getHotelSearchQueryKey,
  setCachedHotelSearch,
} from '../utils/hotelSearchCache'
import { mergeHotelResults } from '../utils/mergeHotelResults'
import type { Hotel } from '../schemas/hotelSearchStreamSchema'
import type { HotelSearchQuery } from '../schemas/hotelSearchSchema'
import type { SearchFilters } from '../types/searchFilters'

export type HotelResult = Hotel & {
  provider: string
}

export type ProviderSearchError = {
  provider: string
  message: string
}

export function useHotelSearch() {
  const [hotels, setHotels] = useState<HotelResult[]>([])
  const [providerErrors, setProviderErrors] = useState<ProviderSearchError[]>(
    [],
  )
  const [isSearching, setIsSearching] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submittedQuery, setSubmittedQuery] = useState<HotelSearchQuery | null>(
    null,
  )
  const abortControllerRef = useRef<AbortController | null>(null)

  const cancelSearch = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsSearching(false)
    setIsComplete(true)
  }, [])

  const runSearch = useCallback((filters: SearchFilters) => {
    abortControllerRef.current?.abort()

    try {
      const parsed = filtersToSearchQuery(filters)
      const cached = getCachedHotelSearch(parsed)

      setSubmittedQuery(parsed)
      setValidationError(null)
      setError(null)

      if (cached) {
        abortControllerRef.current = null
        console.log(
          `[cache] FE serving session cache (key=${getHotelSearchQueryKey(parsed)})`,
        )
        setHotels(cached.hotels)
        setProviderErrors(cached.providerErrors)
        setIsSearching(false)
        setIsComplete(true)
        return
      }

      console.log(
        `[cache] FE session cache empty, opening search stream (key=${getHotelSearchQueryKey(parsed)})`,
      )

      const abortController = new AbortController()

      abortControllerRef.current = abortController
      setHotels([])
      setProviderErrors([])
      setIsSearching(true)
      setIsComplete(false)

      let resultHotels: HotelResult[] = []
      let resultErrors: ProviderSearchError[] = []

      void streamSearchHotels(
        parsed,
        {
          onProviderResult: (provider, providerHotels) => {
            if (abortController.signal.aborted) {
              return
            }

            resultHotels = mergeHotelResults(
              resultHotels,
              provider,
              providerHotels,
            )
            setHotels(resultHotels)
          },
          onProviderError: (provider, message) => {
            if (abortController.signal.aborted) {
              return
            }

            resultErrors = [...resultErrors, { provider, message }]
            setProviderErrors(resultErrors)
          },
          onDone: () => {
            if (abortController.signal.aborted) {
              return
            }

            setCachedHotelSearch(parsed, {
              hotels: resultHotels,
              providerErrors: resultErrors,
            })
            setIsSearching(false)
            setIsComplete(true)
            abortControllerRef.current = null
          },
        },
        abortController.signal,
      ).catch((streamError) => {
        if (abortController.signal.aborted) {
          return
        }

        setIsSearching(false)
        setIsComplete(true)
        abortControllerRef.current = null
        setError(
          streamError instanceof Error
            ? streamError.message
            : 'Failed to search hotels',
        )
      })
    } catch (searchError) {
      setSubmittedQuery(null)
      setIsSearching(false)
      setIsComplete(false)

      if (searchError instanceof ZodError) {
        setValidationError(
          searchError.issues[0]?.message ?? 'Invalid search filters',
        )
        return
      }

      setValidationError('Invalid search filters')
    }
  }, [])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    hotels,
    providerErrors,
    isSearching,
    isComplete,
    error,
    runSearch,
    cancelSearch,
    validationError,
    submittedQuery,
    hasSearched: submittedQuery !== null,
  }
}
