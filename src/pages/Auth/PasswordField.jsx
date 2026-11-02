import { forwardRef, useState } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { useTranslation } from '~/customHooks/useTranslation'

/**
 * Password TextField with a show/hide toggle. Works with react-hook-form `register()` spreads:
 * the forwarded ref is attached to the <input> so RHF can focus the field on validation errors.
 */
const PasswordField = forwardRef(function PasswordField({ autoComplete = 'current-password', ...props }, ref) {
  const { tPrimary } = useTranslation()
  const [visible, setVisible] = useState(false)
  const toggleLabel = tPrimary(visible ? 'authHidePassword' : 'authShowPassword')

  return (
    <TextField
      fullWidth
      variant='outlined'
      {...props}
      inputRef={ref}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton
              edge='end'
              size='small'
              aria-label={toggleLabel}
              aria-pressed={visible}
              title={toggleLabel}
              onClick={() => setVisible(prev => !prev)}
            >
              {visible ? <VisibilityOffRoundedIcon fontSize='small' /> : <VisibilityRoundedIcon fontSize='small' />}
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  )
})

export default PasswordField
