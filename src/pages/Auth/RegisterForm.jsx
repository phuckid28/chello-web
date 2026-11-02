import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import { useForm } from 'react-hook-form'
import {
  EMAIL_RULE,
  PASSWORD_RULE,
  EMAIL_RULE_MESSAGE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { toast } from 'react-toastify'
import { registerUserAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'

function RegisterForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const navigate = useNavigate()
  const { t, tPrimary } = useTranslation()
  const { themeConfig } = usePersonaTheme()

  const submitRegister = (data) => {
    const { email, password } = data
    toast.promise(
      registerUserAPI({ email, password }),
      { pending: tPrimary('registeringToast') }
    ).then(user => {
      navigate(`/login?registeredEmail=${user.email}`)
    })
  }

  return (
    <form onSubmit={handleSubmit(submitRegister)} style={{ width: '100%', maxWidth: 420 }}>
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
                icon={<PersonAddAlt1RoundedIcon sx={{ fontSize: '13px !important' }} />}
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
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={tPrimary('enterPasswordConfirmLabel')}
                type="password"
                variant="outlined"
                error={!!errors['password_confirmation']}
                {...register('password_confirmation', {
                  validate: (value) => {
                    if (value === watch('password')) return true
                    return tPrimary('passwordMismatchMsg')
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName={'password_confirmation'} />
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
              {t('registerBtn')}
            </Button>
          </CardActions>

          <Box sx={{
            px: 3,
            py: 2,
            textAlign: 'center',
            bgcolor: 'action.hover',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="body2" color="text.secondary">{tPrimary('alreadyHaveAccount')}</Typography>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 800, color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                {t('loginLink')}
              </Typography>
            </Link>
          </Box>
        </MuiCard>
      </Zoom>
    </form>
  )
}

export default RegisterForm
