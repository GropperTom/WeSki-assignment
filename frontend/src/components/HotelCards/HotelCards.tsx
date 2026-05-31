import { Stack } from '@mui/material'
import { useMemo } from 'react'
import { resorts } from '../../data/resorts'
import type { HotelResult } from '../../hooks/useHotelSearch'
import HotelCard from '../HotelCard/HotelCard'

type HotelCardsProps = {
  hotels: HotelResult[]
  guests: number
  resortId: string
}

function getResortName(resortId: string) {
  return resorts.find((resort) => String(resort.id) === resortId)?.name ?? resortId
}

function HotelCards({ hotels, guests, resortId }: HotelCardsProps) {
  const resortName = getResortName(resortId)

  const sortedHotels = useMemo(
    () => [...hotels].sort((a, b) => a.price / guests - b.price / guests),
    [hotels, guests],
  )

  return (
    <Stack spacing={2} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {sortedHotels.map((hotel) => (
        <Stack component="li" key={`${hotel.provider}-${hotel.id}`}>
          <HotelCard hotel={hotel} resortName={resortName} guests={guests} />
        </Stack>
      ))}
    </Stack>
  )
}

export default HotelCards
