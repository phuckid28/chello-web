import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { updatePrivacyAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import SettingsSection, { SettingsStack } from '../components/SettingsSection'
import { apiErrorMessage } from '../utils/format'
import { VISIBILITY_OPTIONS, buildPrivacy, isSameSettings } from '../utils/preferences'

const VISIBILITY_LABELS = {
  public: 'setVisPublic',
  members: 'setVisMembers',
  private: 'setVisPrivate'
}

const PRIVACY_TOGGLES = [
  { key: 'showEmail', labelKey: 'setShowEmailLabel' },
  { key: 'showActivity', labelKey: 'setShowActivityLabel' },
  { key: 'showHeatmap', labelKey: 'setShowHeatmapLabel' }
]

function PrivacyTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary } = useTranslation()

  const savedPrivacy = useMemo(() => buildPrivacy(currentUser?.privacy), [currentUser?.privacy])
  const [form, setForm] = useState(savedPrivacy)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(savedPrivacy)
  }, [savedPrivacy])

  const unchanged = isSameSettings(form, savedPrivacy)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updatePrivacyAPI(form)
      const nextUser = res?.user || res
      if (nextUser && typeof nextUser === 'object') {
        dispatch(setCurrentUser(nextUser))
      }
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      toast.error(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsStack>
      <SettingsSection
        index={1}
        label={tPrimary('setTabPrivacy')}
        title={t('setTabPrivacy')}
        description={tPrimary('setPrivacyDesc')}
      >
        <Stack spacing={1.25} sx={{ mb: 3 }}>
          {VISIBILITY_OPTIONS.map((option) => {
            const selected = form.profileVisibility === option
            return (
              <Box
                key={option}
                onClick={() => setForm((prev) => ({ ...prev, profileVisibility: option }))}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  cursor: 'pointer'
                }}
              >
                <Radio checked={selected} value={option} size='small' />
                <Typography variant='body2' sx={{ fontWeight: 700 }}>
                  {tPrimary(VISIBILITY_LABELS[option])}
                </Typography>
              </Box>
            )
          })}
        </Stack>

        <Stack spacing={1.25} sx={{ mb: 2.5 }}>
          {PRIVACY_TOGGLES.map((item) => (
            <Box
              key={item.key}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                {tPrimary(item.labelKey)}
              </Typography>
              <Switch
                checked={Boolean(form[item.key])}
                onChange={(e) => setForm((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                inputProps={{ 'aria-label': tPrimary(item.labelKey) }}
              />
            </Box>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='contained' disabled={saving || unchanged} onClick={handleSave} sx={{ px: 3.5, fontWeight: 800 }}>
            {saving ? tPrimary('v7Saving') : tPrimary('v7Save')}
          </Button>
        </Box>
      </SettingsSection>
    </SettingsStack>
  )
}

export default PrivacyTab
