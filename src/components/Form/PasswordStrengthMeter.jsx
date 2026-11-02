import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import { scorePassword } from '~/utils/passwordStrength'
import { useTranslation } from '~/customHooks/useTranslation'
import { MONO_FONT } from '~/components/Layout/surface'

const SEGMENTS = [1, 2, 3, 4]
// Visually hidden but announced by screen readers
const SR_ONLY = { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }

// Strength level → MUI palette key (theme-aware) + i18n label key
const LEVEL_META = {
  empty: { color: 'divider', labelKey: 'authPwLevelEmpty' },
  weak: { color: 'error.main', labelKey: 'authPwLevelWeak' },
  fair: { color: 'warning.main', labelKey: 'authPwLevelFair' },
  good: { color: 'info.main', labelKey: 'authPwLevelGood' },
  strong: { color: 'success.main', labelKey: 'authPwLevelStrong' }
}

const buildRules = (checks) => [
  { id: 'length', labelKey: 'authPwRuleLength', met: checks.length },
  { id: 'letterDigit', labelKey: 'authPwRuleLetterDigit', met: checks.letter && checks.digit },
  { id: 'maxLength', labelKey: 'authPwRuleMax', met: checks.maxLength }
]

/**
 * Segmented password strength bar + textual level + policy checklist (contract v7 §1).
 * Never color-only: the level is spelled out and each rule has an icon + "met / not met" for screen readers.
 */
function PasswordStrengthMeter({ password = '', id }) {
  const { tPrimary } = useTranslation()
  const result = useMemo(() => scorePassword(password), [password])
  const meta = LEVEL_META[result.level] || LEVEL_META.empty
  const rules = buildRules(result.checks)
  const hasInput = password.length > 0

  return (
    <Box id={id} sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box aria-hidden='true' sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
          {SEGMENTS.map(segment => (
            <Box
              key={segment}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: segment <= result.score ? meta.color : 'action.selected',
                transition: 'background-color 160ms ease-out'
              }}
            />
          ))}
        </Box>
        <Typography
          variant='caption'
          aria-live='polite'
          sx={{ minWidth: 72, textAlign: 'right', fontFamily: MONO_FONT, fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.06em', color: hasInput ? meta.color : 'text.secondary' }}
        >
          <Box component='span' sx={SR_ONLY}>
            {tPrimary('authPwStrengthLabel')}:{' '}
          </Box>
          {tPrimary(meta.labelKey).toUpperCase()}
        </Typography>
      </Box>

      <Box component='ul' sx={{ listStyle: 'none', p: 0, m: 0, mt: 0.75, display: 'grid', gap: 0.25 }}>
        {rules.map(rule => (
          <Box component='li' key={rule.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {rule.met
              ? <CheckCircleRoundedIcon aria-hidden='true' sx={{ fontSize: 15, color: 'success.main' }} />
              : <RadioButtonUncheckedRoundedIcon aria-hidden='true' sx={{ fontSize: 15, color: 'text.disabled' }} />}
            <Typography variant='caption' sx={{ color: rule.met ? 'text.primary' : 'text.secondary', fontWeight: rule.met ? 700 : 500 }}>
              {tPrimary(rule.labelKey)}
              <Box component='span' sx={SR_ONLY}>
                {' '}({tPrimary(rule.met ? 'authPwRuleMet' : 'authPwRuleUnmet')})
              </Box>
            </Typography>
          </Box>
        ))}
      </Box>

      {result.meetsPolicy && result.score < 4 && (
        <Typography variant='caption' sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
          {tPrimary('authPwTip')}
        </Typography>
      )}
    </Box>
  )
}

export default PasswordStrengthMeter
