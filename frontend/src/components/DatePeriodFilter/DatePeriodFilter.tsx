import {
  Box,
  Button,
  FormControl,
  Popover,
  Stack,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import type { DatePeriod } from '../../types/datePeriod'

type DatePeriodFilterProps = {
  value: DatePeriod | null
  onChange: (period: DatePeriod | null) => void
}

function parseLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatPeriod({ start, end }: DatePeriod) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${formatter.format(parseLocalDate(start))} – ${formatter.format(parseLocalDate(end))}`
}

function DatePeriodFilter({ value, onChange }: DatePeriodFilterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [draftStart, setDraftStart] = useState<Dayjs | null>(null)
  const [draftEnd, setDraftEnd] = useState<Dayjs | null>(null)

  const open = Boolean(anchorEl)
  const today = dayjs().startOf('day')

  function handleOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
    setDraftStart(value?.start ? dayjs(value.start) : null)
    setDraftEnd(value?.end ? dayjs(value.end) : null)
  }

  function applyPeriod() {
    if (
      !draftStart ||
      !draftEnd ||
      draftStart.isBefore(today, 'day') ||
      draftEnd.isBefore(draftStart, 'day')
    ) {
      return
    }

    onChange({
      start: draftStart.format('YYYY-MM-DD'),
      end: draftEnd.format('YYYY-MM-DD'),
    })
    setAnchorEl(null)
  }

  function clearPeriod() {
    onChange(null)
    setDraftStart(null)
    setDraftEnd(null)
    setAnchorEl(null)
  }

  const canApply = Boolean(
    draftStart &&
      draftEnd &&
      !draftStart.isBefore(today, 'day') &&
      !draftEnd.isBefore(draftStart, 'day'),
  )

  const endMinDate = draftStart?.isAfter(today, 'day') ? draftStart : today

  return (
    <FormControl fullWidth size="small" sx={{ flex: 1, minWidth: 0 }}>
      <TextField
        label="Period"
        size="small"
        value={value ? formatPeriod(value) : ''}
        placeholder="Select period"
        onClick={handleOpen}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
          input: {
            readOnly: true,
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 320, maxWidth: '100vw' }}>
          <Stack spacing={2}>
            <DatePicker
              label="From"
              value={draftStart}
              onChange={setDraftStart}
              minDate={today}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="To"
              value={draftEnd}
              onChange={setDraftEnd}
              minDate={endMinDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 2, justifyContent: 'flex-end' }}
          >
            {value && (
              <Button size="small" onClick={clearPeriod}>
                Clear
              </Button>
            )}
            <Button size="small" variant="contained" disabled={!canApply} onClick={applyPeriod}>
              Apply
            </Button>
          </Stack>
        </Box>
      </Popover>
    </FormControl>
  )
}

export default DatePeriodFilter
