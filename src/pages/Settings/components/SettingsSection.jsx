import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx } from '~/components/Layout/surface'

// Column wrapper so every Settings tab shares the same measure and rhythm
export function SettingsStack({ children, maxWidth = 760 }) {
  return (
    <Box sx={{ maxWidth, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {children}
    </Box>
  )
}

// Raised section with the editorial `0N / LABEL` heading used across v7 pages
function SettingsSection({ index, label, title, description, actions, children, id, tone }) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <Box
      component="section"
      id={id}
      aria-labelledby={headingId}
      sx={{
        ...surfaceSx,
        p: { xs: 2.25, md: 3 },
        ...(tone === 'danger' ? { borderColor: 'error.main' } : {})
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2.25 }}>
        <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
          {label && <EditorialLabel index={index}>{label}</EditorialLabel>}
          {title && (
            <Typography id={headingId} variant="h6" component="h2" sx={{ fontWeight: 800, letterSpacing: '-0.015em', mt: 0.5 }}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: '65ch' }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>{actions}</Box>}
      </Box>
      {children}
    </Box>
  )
}

export default SettingsSection
