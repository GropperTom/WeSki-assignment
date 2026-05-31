import { Box } from '@mui/material'
import PageHeader from './components/PageHeader/PageHeader'

function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '100%',
      }}
    >
      <PageHeader />
      <Box component="main" sx={{ flex: 1, p: { xs: 2.5, sm: 3 } }} />
    </Box>
  )
}

export default App
