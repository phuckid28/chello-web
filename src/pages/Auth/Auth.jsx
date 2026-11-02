import { useLocation, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { PRIMARY_THEMES_LIST } from '~/utils/animeTheme'
import { SoraBunnyIcon } from '~/components/Icons/SoraBunnyIcon'

function Auth() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'
  const { globalPersonaKey, themeConfig, changePersona } = usePersonaTheme()

  const currentUser = useSelector(selectCurrentUser)
  if (currentUser) {
    return <Navigate to='/' replace={true} />
  }

  return (
    <Box sx={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: { xs: 9, md: 6 },
      backgroundImage: `${themeConfig.boardOverlayDark}, url("${themeConfig.heroImage}")`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Floating Theme Switcher Bar */}
      <Box sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        left: { xs: 16, md: 'auto' },
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 0.75,
        px: 1.5,
        py: 0.85,
        borderRadius: '12px',
        bgcolor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(14px) saturate(150%)',
        border: `1px solid ${themeConfig.columnBorder}`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)'
      }}>
        <SoraBunnyIcon fontSize="small" />
        <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.9)', fontWeight: 700, px: 0.5 }}>
          Theme:
        </Typography>
        {PRIMARY_THEMES_LIST.map((p) => {
          const active = globalPersonaKey === p.id
          return (
            <Button
              key={p.id}
              size="small"
              variant={active ? 'contained' : 'text'}
              onClick={() => changePersona(p.id)}
              sx={{
                color: active ? '#0f172a' : 'rgba(248, 250, 252, 0.86)',
                minWidth: 'auto',
                px: 1.15,
                py: 0.35,
                fontSize: '0.72rem',
                fontWeight: active ? 800 : 600,
                borderRadius: '8px',
                bgcolor: active ? p.accentColor : 'transparent',
                '&:hover': {
                  bgcolor: active ? p.accentColor : 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {p.element}
            </Button>
          )
        })}
        {themeConfig.archetypeLabel && (
          <Chip
            size="small"
            label={themeConfig.archetypeLabel}
            sx={{
              display: { xs: 'none', lg: 'inline-flex' },
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 700,
              color: themeConfig.accentColor,
              bgcolor: themeConfig.badgeBg,
              border: `1px solid ${themeConfig.columnBorder}`
            }}
          />
        )}
      </Box>

      {isLogin && <LoginForm />}
      {isRegister && <RegisterForm />}
    </Box>
  )
}

export default Auth
