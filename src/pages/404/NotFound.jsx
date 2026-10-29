import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import HomeIcon from '@mui/icons-material/Home'
import SvgIcon from '@mui/material/SvgIcon'
import { ReactComponent as PlanetSvg } from '~/assets/404/planet.svg'
import { ReactComponent as AstronautSvg } from '~/assets/404/astronaut.svg'
import particlesBg from '~/assets/404/particles.png'
import { Link } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'

function NotFound() {
  const { t, tPrimary } = useTranslation()
  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      bgcolor: '#25344C',
      color: 'white'
    }}>
      <Box sx={{
        '@keyframes stars': {
          '0%': { backgroundPosition: '-100% 100%' },
          '100%': { backgroundPosition: '0 0 ' }
        },
        animation: 'stars 12s linear infinite alternate',
        width: '100%',
        height: '100%',
        backgroundImage: `url("${particlesBg}")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h1" sx={{ fontSize: '100px', fontWeight: 800 }}>404</Typography>
        <Typography sx={{ fontSize: '18px !important', lineHeight: '25px', fontWeight: 400, maxWidth: '380px', textAlign: 'center' }}>
          <Typography variant="span" sx={{ color: '#fdba26', fontWeight: 700 }}>Chella</Typography><br />
          {tPrimary('notFoundSub')}
        </Typography>
        <Box sx={{ width: '390px', height: '390px', position: 'relative' }}>
          <SvgIcon component={AstronautSvg} inheritViewBox sx={{
            width: '50px', height: '50px', position: 'absolute', top: '20px', right: '25px',
            '@keyframes spinAround': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' }
            },
            animation: 'spinAround 5s linear 0s infinite'
          }} />
          <PlanetSvg />
        </Box>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              borderColor: 'white',
              '&:hover': { color: '#fdba26', borderColor: '#fdba26' }
            }}
          >{t('goHomeBtn')}</Button>
        </Link>
      </Box>
    </Box>
  )
}

export default NotFound
