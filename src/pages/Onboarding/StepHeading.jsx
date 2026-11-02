import { forwardRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { EditorialLabel } from '~/components/Layout/PageShell'

// Editorial `01 / THEME` heading for a wizard step. The h2 receives focus on step change.
const StepHeading = forwardRef(function StepHeading({ index, label, title, subtitle }, ref) {
  return (
    <Box component="header" sx={{ mb: 2.5 }}>
      <EditorialLabel index={index}>{label}</EditorialLabel>
      <Typography
        ref={ref}
        tabIndex={-1}
        variant="h5"
        component="h2"
        sx={{ mt: 0.5, fontWeight: 800, outline: 'none', textWrap: 'balance' }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: '65ch' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
})

export default StepHeading
