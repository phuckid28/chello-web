import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import Alert from '@mui/material/Alert'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useForm } from 'react-hook-form'
import {
  EMAIL_RULE,
  PASSWORD_RULE,
  EMAIL_RULE_MESSAGE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useDispatch } from 'react-redux'
import { loginUserAPI } from '~/redux/user/userSlice'
import { toast } from 'react-toastify'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'

function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, tPrimary } = useTranslation()
  const { themeConfig } = usePersonaTheme()

  const { register, handleSubmit, formState: { errors } } = useForm()
  let [searchParams] = useSearchParams()
  const registeredEmail = searchParams.get('registeredEmail')
  const verifiedEmail = searchParams.get('verifiedEmail')

  const submitLogIn = (data) => {
    const { email, password } = data
    toast.promise(
      dispatch(loginUserAPI({ email, password })),
      { pending: tPrimary('loggingInToast') }
    ).then(res => {
      if (!res.error) navigate('/')
    })
  }

  return (
    <form onSubmit={handleSubmit(submitLogIn)} style={{ width: '100%', maxWidth: 420 }}>
      <Zoom in={true} style={{ transitionDelay: '120ms' }}>
        <MuiCard sx={{
          width: '100%',
          borderRadius: '16px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.96)'),
          backdropFilter: 'blur(18px) saturate(160%)',
          border: `1px solid ${themeConfig.columnBorder}`,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.32)',
          overflow: 'hidden'
        }}>
          <Box sx={{
            height: '3px',
            width: '100%',
            background: `linear-gradient(90deg, ${themeConfig.accentColor} 0%, ${themeConfig.secondaryAccent} 100%)`
          }} />

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

            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Chella
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, mt: 0.25 }}>
              A clone of &quot;C&quot;onfluence - tr&quot;ELL&quot;o - jir&quot;A&quot;
            </Typography>
            {themeConfig.archetypeLabel && (
              <Chip
                size="small"
                icon={<LockOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                label={themeConfig.name}
                sx={{
                  mt: 1.25,
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: 'action.hover'
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', px: 3 }}>
            {verifiedEmail && (
              <Alert severity="success" sx={{ mt: 1.5, borderRadius: '10px', '.MuiAlert-message': { overflow: 'hidden' } }}>
                {tPrimary('emailVerifiedPart1')}&nbsp;
                <Typography component="span" sx={{ fontWeight: 800, color: 'primary.main' }}>{verifiedEmail}</Typography>
                &nbsp;{tPrimary('emailVerifiedPart2')}
              </Alert>
            )}

            {registeredEmail && (
              <Alert severity="info" sx={{ mt: 1.5, borderRadius: '10px', '.MuiAlert-message': { overflow: 'hidden' } }}>
                {tPrimary('emailRegisteredPart1')}&nbsp;
                <Typography component="span" sx={{ fontWeight: 800, color: 'primary.main' }}>{registeredEmail}</Typography>
                <br />{tPrimary('emailRegisteredPart2')}
              </Alert>
            )}
          </Box>

          <Box sx={{ px: 3, pt: 1, pb: 2 }}>
            <Box sx={{ mt: 1.5 }}>
              <TextField
                autoFocus
                fullWidth
                label={tPrimary('enterEmailLabel')}
                type="text"
                variant="outlined"
                error={!!errors['email']}
                {...register('email', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: EMAIL_RULE,
                    message: EMAIL_RULE_MESSAGE
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName={'email'} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={tPrimary('enterPasswordLabel')}
                type="password"
                variant="outlined"
                error={!!errors['password']}
                {...register('password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName={'password'} />
            </Box>
          </Box>

          <CardActions sx={{ px: 3, pb: 2 }}>
            <Button
              className='interceptor-loading'
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ py: 1.2, fontWeight: 800 }}
            >
              {t('loginBtn')}
            </Button>
          </CardActions>

          <Box sx={{
            px: 3,
            py: 2,
            textAlign: 'center',
            bgcolor: 'action.hover',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="body2" color="text.secondary">{tPrimary('newToChella')}</Typography>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 800, color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                {t('createAccountLink')}
              </Typography>
            </Link>
          </Box>
        </MuiCard>
      </Zoom>
    </form>
  )
}

export default LoginForm
