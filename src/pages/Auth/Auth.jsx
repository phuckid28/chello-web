import { useLocation, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { ANIME_THEMES } from '~/utils/animeTheme'

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
      justifyContent: 'flex-start',
      backgroundImage: `${themeConfig.boardOverlayDark}, url("${themeConfig.heroImage}")`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Floating Archon Theme Switcher on Login/Register screen */}
      <Box sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: '12px',
        bgcolor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${themeConfig.accentColor}`
      }}>
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, px: 0.5 }}>
          Archon Theme:
        </Typography>
        {Object.values(ANIME_THEMES).map((p) => (
          <Button
            key={p.id}
            size="small"
            variant={globalPersonaKey === p.id ? 'contained' : 'text'}
            onClick={() => changePersona(p.id)}
            sx={{
              color: 'white',
              minWidth: 'auto',
              px: 1.2,
              py: 0.4,
              fontSize: '0.75rem',
              bgcolor: globalPersonaKey === p.id ? p.accentColor : 'transparent'
            }}
          >
            {p.name.split('•')[0].trim()}
          </Button>
        ))}
      </Box>

      {isLogin && <LoginForm />}
      {isRegister && <RegisterForm />}
    </Box>
  )
}

export default Auth
