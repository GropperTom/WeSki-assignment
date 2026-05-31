import { Box } from '@mui/material'
import HotelSearchResults from './components/HotelSearchResults/HotelSearchResults'
import PageHeader from './components/PageHeader/PageHeader'
import { useHotelSearch } from './hooks/useHotelSearch'
import { useSearchFilters } from './hooks/useSearchFilters'

function App() {
  const searchFilters = useSearchFilters()
  const hotelSearch = useHotelSearch()

  function handleSearch() {
    if (hotelSearch.isSearching) {
      hotelSearch.cancelSearch()
      return
    }

    searchFilters.search()
    hotelSearch.runSearch(searchFilters.filters)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '100%',
      }}
    >
      <PageHeader
        filters={searchFilters.filters}
        setResortId={searchFilters.setResortId}
        setGuests={searchFilters.setGuests}
        setPeriod={searchFilters.setPeriod}
        onSearch={handleSearch}
        isSearching={hotelSearch.isSearching}
      />
      <Box component="main" sx={{ flex: 1, p: { xs: 2.5, sm: 3 } }}>
        <HotelSearchResults
          hotels={hotelSearch.hotels}
          providerErrors={hotelSearch.providerErrors}
          isSearching={hotelSearch.isSearching}
          isComplete={hotelSearch.isComplete}
          error={hotelSearch.error}
          validationError={hotelSearch.validationError}
          hasSearched={hotelSearch.hasSearched}
          guests={hotelSearch.submittedQuery?.guests ?? Number(searchFilters.filters.guests)}
          resortId={String(hotelSearch.submittedQuery?.resort ?? searchFilters.filters.resortId)}
        />
      </Box>
    </Box>
  )
}

export default App
