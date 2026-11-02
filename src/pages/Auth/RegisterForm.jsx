import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { EMAIL_RULE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import PasswordStrengthMeter from '~/components/Form/PasswordStrengthMeter'
import { registerAccountAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import AuthCard from './AuthCard'
import AuthFooterLink from './AuthFooterLink'
import PasswordField from './PasswordField'
import {
  buildRegisterPayload,
  buildRegisteredRedirect,
  passwordPolicyErrorKey,
  splitTemplate
} from './authHelpers'

function RegisterForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      email: '',
      password: '',
      password_confirmation: '',
      acceptTerms: false
    }
  })
  const navigate = useNavigate()
  const { t, tPrimary } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const passwordValue = watch('password') || ''
  const termsTokens = splitTemplate(tPrimary('authTermsAgree'))

  const submitRegister = async (data) => {
    const { email, password } = data
    setSubmitting(true)
    setSubmitError('')
    try {
      await registerAccountAPI(buildRegisterPayload({ email, password }))
      toast.success(tPrimary('authRegisterSent'))
      navigate(buildRegisteredRedirect(email))
    } catch (error) {
      const msg = error?.response?.data?.message || tPrimary('v7ErrorGeneric')
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const renderTermsLabel = () => (
    <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5 }}>
      {termsTokens.map((token, idx) => {
        if (token.type === 'slot' && token.name === 'terms') {
          return (
            <Typography
              key={idx}
              component={Link}
              to='/legal/terms'
              target='_blank'
              rel='noopener noreferrer'
              variant='caption'
              aria-label={`${tPrimary('authTermsLink')} ${tPrimary('authOpensNewTab')}`}
              onClick={(e) => e.stopPropagation()}
              sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'underline' }}
            >
              {tPrimary('authTermsLink')}
            </Typography>
          )
        }
        if (token.type === 'slot' && token.name === 'privacy') {
          return (
            <Typography
              key={idx}
              component={Link}
              to='/legal/privacy'
              target='_blank'
              rel='noopener noreferrer'
              variant='caption'
              aria-label={`${tPrimary('authPrivacyLink')} ${tPrimary('authOpensNewTab')}`}
              onClick={(e) => e.stopPropagation()}
              sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'underline' }}
            >
              {tPrimary('authPrivacyLink')}
            </Typography>
          )
        }
        return <span key={idx}>{token.value}</span>
      })}
    </Typography>
  )

  return (
    <AuthCard
      chipIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: '13px !important' }} />}
      onSubmit={handleSubmit(submitRegister)}
      footer={<AuthFooterLink prompt={tPrimary('alreadyHaveAccount')} to='/login' label={t('loginLink')} />}
    >
      <Box sx={{ px: 3, pt: 1, pb: 2 }}>
        {submitError && (
          <Alert severity='error' role='alert' sx={{ mt: 1, borderRadius: '10px' }}>
            {submitError}
          </Alert>
        )}

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
            autoComplete='new-password'
            aria-describedby='register-password-strength'
            error={Boolean(errors.password)}
            {...register('password', {
              required: tPrimary('authFieldRequired'),
              validate: (val) => {
                const errKey = passwordPolicyErrorKey(val)
                return errKey ? tPrimary(errKey) : true
              }
            })}
          />
          <PasswordStrengthMeter id='register-password-strength' password={passwordValue} />
          <FieldErrorAlert errors={errors} fieldName='password' />
        </Box>

        <Box sx={{ mt: 2 }}>
          <PasswordField
            label={tPrimary('enterPasswordConfirmLabel')}
            autoComplete='new-password'
            error={Boolean(errors.password_confirmation)}
            {...register('password_confirmation', {
              required: tPrimary('authFieldRequired'),
              validate: (value) => {
                if (value === watch('password')) return true
                return tPrimary('passwordMismatchMsg')
              }
            })}
          />
          <FieldErrorAlert errors={errors} fieldName='password_confirmation' />
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <FormControlLabel
            sx={{ alignItems: 'flex-start', m: 0 }}
            control={
              <Checkbox
                size='small'
                sx={{ pt: 0, pb: 0, pr: 1 }}
                {...register('acceptTerms', {
                  validate: (checked) => checked || tPrimary('authTermsRequired')
                })}
              />
            }
            label={renderTermsLabel()}
          />
          <FieldErrorAlert errors={errors} fieldName='acceptTerms' />
        </Box>
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
          {t('registerBtn')}
        </Button>
      </CardActions>
    </AuthCard>
  )
}

export default RegisterForm
