import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { resorts } from '../../data/resorts'
import { useSearchFilters } from '../../hooks/useSearchFilters'
import DatePeriodFilter from '../DatePeriodFilter/DatePeriodFilter'

const guestOptions = Array.from({ length: 10 }, (_, index) => index + 1)

function PageHeader() {
  const { filters, setResortId, setGuests, setPeriod, search } = useSearchFilters()

  return (
    <Paper
      component="header"
      elevation={0}
      square
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="h5" component="h1" sx={{ mb: 2.5 }}>
        Hotel Search
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'flex-end' }, width: '100%' }}
      >
        <FormControl fullWidth size="small" sx={{ flex: 1, minWidth: 0 }}>
          <InputLabel id="resort-label" shrink>
            Resort
          </InputLabel>
          <Select
            labelId="resort-label"
            value={filters.resortId}
            label="Resort"
            onChange={(event) => setResortId(event.target.value)}
          >
            {resorts.map((resort) => (
              <MenuItem key={resort.id} value={String(resort.id)}>
                {resort.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ flex: 1, minWidth: 0 }}>
          <InputLabel id="guests-label" shrink>
            Guests
          </InputLabel>
          <Select
            labelId="guests-label"
            value={filters.guests}
            label="Guests"
            onChange={(event) => setGuests(event.target.value)}
          >
            {guestOptions.map((count) => (
              <MenuItem key={count} value={String(count)}>
                {count} {count === 1 ? 'person' : 'people'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePeriodFilter value={filters.period} onChange={setPeriod} />
        <Button
          variant="contained"
          size="medium"
          sx={{ minWidth: 100, height: 40, flexShrink: 0 }}
          onClick={search}
        >
          Search
        </Button>
      </Stack>
    </Paper>
  )
}

export default PageHeader
