import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import AuthShowcase from './AuthShowcase'

/**
 * Shared shell of every public auth page (login, register, forgot/reset password):
 * themed hero background, editorial showcase on the left, the auth card (children) on the right.
 */
function AuthLayout({ children }) {
  const { themeConfig } = usePersonaTheme()

  return (
    <Box
      component='main'
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        justifyContent: 'center',
        px: { xs: 2, md: 5 },
        py: { xs: 3, md: 4 },
        backgroundImage: `${themeConfig.boardOverlayDark}, url("${themeConfig.heroImage}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '1220px', mx: 'auto' }}>
        <Grid container spacing={3} alignItems='stretch'>
          <Grid xs={12} md={7} sx={{ display: 'flex' }}>
            <AuthShowcase />
          </Grid>
          <Grid xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default AuthLayout
