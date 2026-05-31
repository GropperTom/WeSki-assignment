import { Box, Card, CardContent, Rating, Typography } from '@mui/material'
import type { HotelResult } from '../../hooks/useHotelSearch'

type HotelCardProps = {
  hotel: HotelResult
  resortName: string
  guests: number
}

function formatPricePerPerson(price: number, guests: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price / guests)
}

function HotelCard({ hotel, resortName, guests }: HotelCardProps) {
  const pricePerPerson = formatPricePerPerson(hotel.price, guests)

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'stretch',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: 200 },
          height: { xs: 160, sm: 'auto' },
          alignSelf: 'stretch',
          bgcolor: 'action.hover',
        }}
      >
        {hotel.imageUrl ? (
          <Box
            component="img"
            src={hotel.imageUrl}
            alt={hotel.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No image
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.5,
          py: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          {hotel.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating
            value={hotel.rating}
            readOnly
            precision={0.5}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            {hotel.rating}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {resortName}
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
          {pricePerPerson}{' '}
          <Typography component="span" variant="body2" color="text.secondary">
            per person
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  )
}

export default HotelCard
