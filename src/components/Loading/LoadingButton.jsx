import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import ThemedLoader from '~/components/Loading/ThemedLoader'

const INLINE_SIZE = 18

// MUI Button with a `loading` state: themed ring replaces the start icon, width is kept stable,
// the button is disabled and announced as busy to assistive tech.
function LoadingButton({ loading = false, loadingLabel, startIcon, disabled, children, sx, ...rest }) {
  return (
    <Button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      startIcon={loading ? <ThemedLoader inline size={INLINE_SIZE} /> : startIcon}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&::after': loading ? {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)',
          animation: 'fxSheen 1.4s ease-in-out infinite',
          pointerEvents: 'none'
        } : undefined,
        ...sx
      }}
    >
      <Box component="span" sx={{ opacity: loading ? 0.85 : 1, transition: 'opacity 0.2s ease' }}>
        {loading && loadingLabel ? loadingLabel : children}
      </Box>
    </Button>
  )
}

export default LoadingButton
