import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ThemedLoader from '~/components/Loading/ThemedLoader'
import { useFxTheme } from '~/fx/fxThemeStore'

const DOT_COUNT = 3

function PageLoadingSpinner({ caption }) {
  const { theme } = useFxTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1.5,
        width: '100vw',
        height: '100vh',
        background: (muiTheme) => (muiTheme.palette.mode === 'dark' ? theme.boardOverlayDark : theme.boardOverlayLight),
        animation: 'fxPageZoom 0.35s ease both'
      }}
    >
      <ThemedLoader size={96} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontWeight: 800, letterSpacing: '0.04em' }}>{caption}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }} aria-hidden="true">
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <Box
              key={i}
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: theme.accentColor,
                animation: `fxDots 1.2s ease-in-out ${i * 0.16}s infinite`
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default PageLoadingSpinner
