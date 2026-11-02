import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { EMAIL_RULE, BACKUP_CODE_RULE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { loginUserAPI } from '~/redux/user/userSlice'
import { resendVerificationAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import AuthCard from './AuthCard'
import AuthFooterLink from './AuthFooterLink'
import PasswordField from './PasswordField'
import {
  LOGIN_ERROR_KINDS,
  TOTP_LENGTH,
  buildLoginPayload,
  formatLockedUntil,
  normalizeTotp,
  resolveLoginError
} from './authHelpers'

function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, tPrimary, formatMessage, lang } = useTranslation()
  const [searchParams] = useSearchParams()
  const registeredEmail = searchParams.get('registeredEmail')
  const verifiedEmail = searchParams.get('verifiedEmail')

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: { email: registeredEmail || verifiedEmail || '', password: '' }
  })

  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [credentials, setCredentials] = useState(null)
  const [twoFactorStep, setTwoFactorStep] = useState(false)
  const [twoFactorMode, setTwoFactorMode] = useState('totp')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorFormatErr, setTwoFactorFormatErr] = useState('')

  const [resendOpen, setResendOpen] = useState(false)
  const [resendEmail, setResendEmail] = useState(registeredEmail || '')
  const [resendEmailErr, setResendEmailErr] = useState('')
  const [resendBusy, setResendBusy] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  const renderErrorText = (err) => {
    if (!err) return null
    if (err.kind === LOGIN_ERROR_KINDS.LOCKED) {
      const time = formatLockedUntil(err.lockedUntil, lang)
      return time ? formatMessage('authErrLocked', { time }) : tPrimary('authErrLockedNoTime')
    }
    if (err.kind === LOGIN_ERROR_KINDS.INVALID_CODE) return tPrimary('authTwoFaInvalid')
    if (err.kind === LOGIN_ERROR_KINDS.NETWORK) return tPrimary('authErrNetwork')
    if (err.kind === LOGIN_ERROR_KINDS.SERVER) return tPrimary('v7ErrorGeneric')
    return tPrimary('authErrInvalidCredentials')
  }

  const runLogin = async (creds, twoFactor = null) => {
    setSubmitting(true)
    setAuthError(null)
    try {
      const res = await dispatch(loginUserAPI(buildLoginPayload(creds, twoFactor)))
      if (!res.error) {
        navigate('/')
        return
      }
      const resolved = resolveLoginError(res.payload, Boolean(twoFactor))
      if (resolved.kind === LOGIN_ERROR_KINDS.TOTP_REQUIRED) {
        setCredentials(creds)
        setTwoFactorStep(true)
        setTwoFactorMode('totp')
        setTwoFactorCode('')
        setTwoFactorFormatErr('')
        return
      }
      setAuthError(resolved)
    } finally {
      setSubmitting(false)
    }
  }

  const submitCredentials = (data) => {
    runLogin({ email: data.email, password: data.password }, null)
  }

  const submitTwoFactor = (event) => {
    event.preventDefault()
    if (!credentials) return
    setTwoFactorFormatErr('')
    if (twoFactorMode === 'totp') {
      const normalized = normalizeTotp(twoFactorCode)
      if (normalized.length !== TOTP_LENGTH) {
        setTwoFactorFormatErr(tPrimary('authTwoFaCodeFormat'))
        return
      }
      runLogin(credentials, { mode: 'totp', code: normalized })
      return
    }
    const trimmed = twoFactorCode.trim()
    if (!BACKUP_CODE_RULE.test(trimmed)) {
      setTwoFactorFormatErr(tPrimary('authTwoFaBackupFormat'))
      return
    }
    runLogin(credentials, { mode: 'backup', code: trimmed })
  }

  const handleToggleTwoFactorMode = () => {
    setTwoFactorMode((prev) => (prev === 'totp' ? 'backup' : 'totp'))
    setTwoFactorCode('')
    setTwoFactorFormatErr('')
    setAuthError(null)
  }

  const handleBackToCredentials = () => {
    setTwoFactorStep(false)
    setCredentials(null)
    setTwoFactorCode('')
    setTwoFactorFormatErr('')
    setAuthError(null)
  }

  const handleOpenResend = () => {
    const currentEmail = getValues('email')
    if (!resendEmail && currentEmail) setResendEmail(currentEmail)
    setResendOpen((prev) => !prev)
  }

  const handleResendSubmit = async () => {
    const trimmed = resendEmail.trim()
    if (!trimmed) {
      setResendEmailErr(tPrimary('authFieldRequired'))
      return
    }
    if (!EMAIL_RULE.test(trimmed)) {
      setResendEmailErr(tPrimary('authEmailInvalid'))
      return
    }
    setResendEmailErr('')
    setResendBusy(true)
    setResendSent(false)
    try {
      await resendVerificationAPI(trimmed)
      setResendSent(true)
    } catch {
      setResendSent(true)
    } finally {
      setResendBusy(false)
    }
  }

  const errorMessage = renderErrorText(authError)

  return (
    <AuthCard
      chipIcon={twoFactorStep
        ? <ShieldOutlinedIcon sx={{ fontSize: '13px !important' }} />
        : <LockOutlinedIcon sx={{ fontSize: '13px !important' }} />}
      heading={twoFactorStep ? tPrimary('authTwoFaTitle') : undefined}
      description={twoFactorStep
        ? tPrimary(twoFactorMode === 'backup' ? 'authTwoFaBackupSubtitle' : 'authTwoFaSubtitle')
        : undefined}
      onSubmit={twoFactorStep ? submitTwoFactor : handleSubmit(submitCredentials)}
      footer={<AuthFooterLink prompt={tPrimary('newToChella')} to='/register' label={t('createAccountLink')} />}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', px: 3 }}>
        {verifiedEmail && !twoFactorStep && (
          <Alert severity='success' sx={{ mt: 1.5, borderRadius: '10px', '.MuiAlert-message': { overflow: 'hidden' } }}>
            {tPrimary('emailVerifiedPart1')}&nbsp;
            <Typography component='span' sx={{ fontWeight: 800, color: 'primary.main' }}>{verifiedEmail}</Typography>
            &nbsp;{tPrimary('emailVerifiedPart2')}
          </Alert>
        )}

        {registeredEmail && !twoFactorStep && (
          <Alert severity='info' sx={{ mt: 1.5, borderRadius: '10px', '.MuiAlert-message': { overflow: 'hidden' } }}>
            {formatMessage('authRegisteredNotice', { email: registeredEmail })}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity='error' role='alert' sx={{ mt: 1.5, borderRadius: '10px' }}>
            {errorMessage}
          </Alert>
        )}
      </Box>

      {twoFactorStep ? (
        <Box sx={{ px: 3, pt: 2, pb: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label={tPrimary(twoFactorMode === 'backup' ? 'authTwoFaBackupLabel' : 'authTwoFaCodeLabel')}
            value={twoFactorCode}
            onChange={(e) => {
              const val = e.target.value
              setTwoFactorCode(twoFactorMode === 'totp' ? normalizeTotp(val) : val)
              if (twoFactorFormatErr) setTwoFactorFormatErr('')
            }}
            inputProps={twoFactorMode === 'totp'
              ? { inputMode: 'numeric', autoComplete: 'one-time-code', maxLength: TOTP_LENGTH }
              : { autoComplete: 'off', maxLength: 32 }}
            error={Boolean(twoFactorFormatErr)}
            helperText={twoFactorFormatErr || undefined}
          />

          <Button
            type='submit'
            variant='contained'
            color='primary'
            size='large'
            fullWidth
            disabled={submitting}
            sx={{ mt: 2, py: 1.2, fontWeight: 800 }}
          >
            {tPrimary('authTwoFaVerify')}
          </Button>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
            <Button size='small' onClick={handleToggleTwoFactorMode} sx={{ fontWeight: 700, textTransform: 'none' }}>
              {tPrimary(twoFactorMode === 'backup' ? 'authTwoFaUseTotp' : 'authTwoFaUseBackup')}
            </Button>
            <Button size='small' color='inherit' onClick={handleBackToCredentials} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              {tPrimary('authTwoFaBack')}
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ px: 3, pt: 1, pb: 1.5 }}>
            <Box sx={{ mt: 1.5 }}>
              <TextField
                autoFocus
                fullWidth
                label={tPrimary('enterEmailLabel')}
                type='email'
                autoComplete='email'
                variant='outlined'
                error={Boolean(errors.email)}
                {...register('email', {
                  required: tPrimary('authFieldRequired'),
                  pattern: {
                    value: EMAIL_RULE,
                    message: tPrimary('authEmailInvalid')
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName='email' />
            </Box>

            <Box sx={{ mt: 2 }}>
              <PasswordField
                label={tPrimary('enterPasswordLabel')}
                autoComplete='current-password'
                error={Boolean(errors.password)}
                {...register('password', {
                  required: tPrimary('authFieldRequired')
                })}
              />
              <FieldErrorAlert errors={errors} fieldName='password' />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Typography
                component={Link}
                to='/forgot-password'
                variant='caption'
                sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {tPrimary('authForgotLink')}
              </Typography>
              <Button
                size='small'
                onClick={handleOpenResend}
                sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', p: 0, minWidth: 0 }}
              >
                {tPrimary('authResendLink')}
              </Button>
            </Box>

            <Collapse in={resendOpen} unmountOnExit>
              <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '10px', bgcolor: 'action.hover', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                  {tPrimary('authResendTitle')}
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25, mb: 1 }}>
                  {tPrimary('authResendDesc')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size='small'
                    fullWidth
                    type='email'
                    label={tPrimary('enterEmailLabel')}
                    value={resendEmail}
                    onChange={(e) => {
                      setResendEmail(e.target.value)
                      if (resendEmailErr) setResendEmailErr('')
                    }}
                    error={Boolean(resendEmailErr)}
                    helperText={resendEmailErr || undefined}
                  />
                  <Button
                    variant='outlined'
                    size='small'
                    disabled={resendBusy}
                    onClick={handleResendSubmit}
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {tPrimary('authResendSubmit')}
                  </Button>
                </Box>
                {resendSent && (
                  <Alert severity='success' sx={{ mt: 1, borderRadius: '8px' }}>
                    {tPrimary('authResendSent')}
                  </Alert>
                )}
              </Box>
            </Collapse>
          </Box>

          <CardActions sx={{ px: 3, pb: 2 }}>
            <Button
              className='interceptor-loading'
              type='submit'
              variant='contained'
              color='primary'
              size='large'
              fullWidth
              disabled={submitting}
              sx={{ py: 1.2, fontWeight: 800 }}
            >
              {t('loginBtn')}
            </Button>
          </CardActions>
        </>
      )}
    </AuthCard>
  )
}

export default LoginForm
