import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import AppBar from '~/components/AppBar/AppBar'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { MONO_FONT } from './surface'

// Editorial section label used across v7 pages, e.g. `01 / SECURITY`
export function EditorialLabel({ index, children, sx }) {
  const { themeConfig } = usePersonaTheme()
  return (
    <Typography
      variant="caption"
      component="p"
      sx={{
        fontFamily: MONO_FONT,
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: themeConfig.accentColor,
        ...sx
      }}
    >
      {index ? `${String(index).padStart(2, '0')} / ` : ''}{children}
    </Typography>
  )
}

// Shared page frame for v7 pages: global AppBar, themed ground, editorial heading and content column
function PageShell({ index, eyebrow, title, subtitle, actions, maxWidth = 1080, children, banner }) {
  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => (theme.palette.mode === 'dark'
          ? 'var(--chella-ground-dark, #0b1120)'
          : 'var(--chella-ground-light, #f8fafc)')
      }}
    >
      <AppBar />
      {banner}
      <Box component="main" sx={{ maxWidth, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
        {(title || eyebrow) && (
          <Box
            component="header"
            sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}
          >
            <Box sx={{ minWidth: 0 }}>
              {eyebrow && <EditorialLabel index={index}>{eyebrow}</EditorialLabel>}
              {title && (
                <Typography variant="h4" component="h1" sx={{ mt: 0.5, fontSize: { xs: '1.6rem', md: '2.1rem' } }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: '65ch' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
          </Box>
        )}
        {children}
      </Box>
    </Container>
  )
}

export default PageShell
