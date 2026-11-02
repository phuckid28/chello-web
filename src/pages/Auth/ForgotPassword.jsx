import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import { useForm } from 'react-hook-form'
import { EMAIL_RULE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { forgotPasswordAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import AuthLayout from './AuthLayout'
import AuthCard from './AuthCard'
import AuthFooterLink from './AuthFooterLink'

function ForgotPassword() {
  const { tPrimary, formatMessage } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' }
  })
  const [submitting, setSubmitting] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [networkError, setNetworkError] = useState('')

  const onSubmit = async (data) => {
    const trimmed = String(data.email || '').trim()
    setSubmitting(true)
    setNetworkError('')
    try {
      await forgotPasswordAPI(trimmed)
      setSubmittedEmail(trimmed)
    } catch (error) {
      if (!error?.response) {
        setNetworkError(tPrimary('authErrNetwork'))
      } else {
        setSubmittedEmail(trimmed)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        chipIcon={<KeyRoundedIcon sx={{ fontSize: '13px !important' }} />}
        heading={tPrimary('authForgotTitle')}
        description={tPrimary('authForgotSubtitle')}
        onSubmit={submittedEmail ? undefined : handleSubmit(onSubmit)}
        footer={<AuthFooterLink to='/login' label={tPrimary('authBackToLogin')} />}
      >
        {submittedEmail ? (
          <Box sx={{ px: 3, pt: 2, pb: 3 }}>
            <Alert severity='success' role='status' sx={{ borderRadius: '10px' }}>
              {formatMessage('authForgotSent', { email: submittedEmail })}
            </Alert>
          </Box>
        ) : (
          <>
            <Box sx={{ px: 3, pt: 2, pb: 2 }}>
              {networkError && (
                <Alert severity='error' role='alert' sx={{ mb: 1.5, borderRadius: '10px' }}>
                  {networkError}
                </Alert>
              )}

              <TextField
                autoFocus
                fullWidth
                type='email'
                autoComplete='email'
                label={tPrimary('enterEmailLabel')}
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

            <CardActions sx={{ px: 3, pb: 2 }}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                size='large'
                fullWidth
                disabled={submitting}
                sx={{ py: 1.2, fontWeight: 800 }}
              >
                {tPrimary('authForgotSubmit')}
              </Button>
            </CardActions>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  )
}

export default ForgotPassword
