import { Box, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'


function PageLoadingSpinner({ caption }) {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 2,
      width: '100vw',
      height: '100vh'
    }}>
      <CircularProgress />
      <Typography>{caption}</Typography>
    </Box>
  )
}

export default PageLoadingSpinner