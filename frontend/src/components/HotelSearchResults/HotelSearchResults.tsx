import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material'
import type { HotelResult, ProviderSearchError } from '../../hooks/useHotelSearch'

type HotelSearchResultsProps = {
  hotels: HotelResult[]
  providerErrors: ProviderSearchError[]
  isSearching: boolean
  isComplete: boolean
  error: string | null
  validationError: string | null
  hasSearched: boolean
}

function HotelSearchResults({
  hotels,
  providerErrors,
  isSearching,
  isComplete,
  error,
  validationError,
  hasSearched,
}: HotelSearchResultsProps) {
  if (validationError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {validationError}
      </Alert>
    )
  }

  if (!hasSearched) {
    return (
      <Typography color="text.secondary">
        Select your filters and click Search to find hotels.
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {isSearching && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">
            {hotels.length > 0
              ? 'Still searching for more hotels...'
              : 'Searching hotels...'}
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {providerErrors.map((providerError) => (
        <Alert key={providerError.provider} severity="warning">
          {providerError.provider}: {providerError.message}
        </Alert>
      ))}

      {hotels.length > 0 && (
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {hotels.map((hotel) => (
            <Box
              component="li"
              key={`${hotel.provider}-${hotel.id}`}
              sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography>{hotel.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {hotel.provider} · {hotel.rating} stars · €{hotel.price}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {isComplete && hotels.length === 0 && !error && providerErrors.length === 0 && (
        <Typography color="text.secondary">
          No hotels found for your search.
        </Typography>
      )}
    </Stack>
  )
}

export default HotelSearchResults
