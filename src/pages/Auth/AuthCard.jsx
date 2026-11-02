import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import Zoom from '@mui/material/Zoom'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'

const CARD_SX = {
  width: '100%',
  borderRadius: '16px',
  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.96)'),
  backdropFilter: 'blur(18px) saturate(160%)',
  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.32)',
  overflow: 'hidden'
}

/**
 * Themed auth card: accent gradient top bar, Chella badge + tagline, persona chip,
 * optional step heading/description, body (children) and footer.
 * Renders a <form> when `onSubmit` is given so Enter submits naturally.
 */
function AuthCard({ chipIcon, heading, description, onSubmit, children, footer }) {
  const { themeConfig } = usePersonaTheme()
  const Wrapper = onSubmit ? 'form' : 'div'

  return (
    <Wrapper onSubmit={onSubmit} noValidate={onSubmit ? true : undefined} style={{ width: '100%', maxWidth: 420 }}>
      <Zoom in={true} style={{ transitionDelay: '120ms' }}>
        <Card sx={{ ...CARD_SX, border: `1px solid ${themeConfig.columnBorder}` }}>
          <Box sx={{ height: '3px', width: '100%', background: `linear-gradient(90deg, ${themeConfig.accentColor} 0%, ${themeConfig.secondaryAccent} 100%)` }} />

          <Box sx={{ pt: 3, px: 3, pb: 1, textAlign: 'center' }}>
            <Box sx={{
              width: 48,
              height: 48,
              mx: 'auto',
              mb: 1.5,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: themeConfig.badgeBg,
              border: `1px solid ${themeConfig.columnBorder}`,
              color: themeConfig.accentColor
            }}>
              <SoraRibbonIcon sx={{ fontSize: 24 }} />
            </Box>

            <Typography variant='h5' component='p' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Chella
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, mt: 0.25 }}>
              A clone of &quot;C&quot;onfluence - tr&quot;ELL&quot;o - jir&quot;A&quot;
            </Typography>
            {themeConfig.archetypeLabel && (
              <Chip
                size='small'
                icon={chipIcon}
                label={themeConfig.name}
                sx={{ mt: 1.25, height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: 'action.hover' }}
              />
            )}
          </Box>

          {(heading || description) && (
            <Box sx={{ px: 3, pt: 1.5, textAlign: 'center' }}>
              {heading && (
                <Typography variant='h6' component='h1' sx={{ fontWeight: 800, letterSpacing: '-0.01em', textWrap: 'balance' }}>
                  {heading}
                </Typography>
              )}
              {description && (
                <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary', textWrap: 'pretty' }}>
                  {description}
                </Typography>
              )}
            </Box>
          )}

          {children}

          {footer && (
            <Box sx={{ px: 3, py: 2, textAlign: 'center', bgcolor: 'action.hover', borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
              {footer}
            </Box>
          )}
        </Card>
      </Zoom>
    </Wrapper>
  )
}

export default AuthCard
