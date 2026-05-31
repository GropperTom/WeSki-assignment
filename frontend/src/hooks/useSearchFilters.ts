import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { DatePeriod } from '../types/datePeriod'
import {
  filtersToParams,
  parseFiltersFromParams,
  type SearchFilters,
} from '../types/searchFilters'

export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  )

  const updateFilters = useCallback(
    (partial: Partial<SearchFilters>) => {
      const next: SearchFilters = { ...filters, ...partial }
      setSearchParams(filtersToParams(next), { replace: true })
    },
    [filters, setSearchParams],
  )

  const setResortId = useCallback(
    (resortId: string) => updateFilters({ resortId }),
    [updateFilters],
  )

  const setGuests = useCallback(
    (guests: string) => updateFilters({ guests }),
    [updateFilters],
  )

  const setPeriod = useCallback(
    (period: DatePeriod | null) => updateFilters({ period }),
    [updateFilters],
  )

  const search = useCallback(() => {
    setSearchParams(filtersToParams(filters), { replace: false })
  }, [filters, setSearchParams])

  return {
    filters,
    setResortId,
    setGuests,
    setPeriod,
    search,
  }
}
