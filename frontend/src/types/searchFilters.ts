import { resorts } from '../data/resorts'
import type { DatePeriod } from './datePeriod'

export type SearchFilters = {
  resortId: string
  guests: string
  period: DatePeriod | null
}

export const DEFAULT_RESORT_ID = String(resorts[0].id)
export const DEFAULT_GUESTS = '2'

const validResortIds = new Set(resorts.map((resort) => String(resort.id)))

export function parseFiltersFromParams(params: URLSearchParams): SearchFilters {
  const resort = params.get('resort')
  const guests = params.get('guests')
  const start = params.get('start')
  const end = params.get('end')

  const resortId =
    resort && validResortIds.has(resort) ? resort : DEFAULT_RESORT_ID

  const guestsNumber = guests ? Number(guests) : Number(DEFAULT_GUESTS)
  const guestsValue =
    Number.isInteger(guestsNumber) && guestsNumber >= 1 && guestsNumber <= 10
      ? String(guestsNumber)
      : DEFAULT_GUESTS

  let period: DatePeriod | null = null
  if (
    start &&
    end &&
    /^\d{4}-\d{2}-\d{2}$/.test(start) &&
    /^\d{4}-\d{2}-\d{2}$/.test(end) &&
    end >= start
  ) {
    period = { start, end }
  }

  return {
    resortId,
    guests: guestsValue,
    period,
  }
}

export function filtersToParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams()
  params.set('resort', filters.resortId)
  params.set('guests', filters.guests)

  if (filters.period) {
    params.set('start', filters.period.start)
    params.set('end', filters.period.end)
  }

  return params
}
