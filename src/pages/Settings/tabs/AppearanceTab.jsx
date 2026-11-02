import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { updatePreferencesAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import FxSettingsPanel from '../FxSettingsPanel'
import SettingsSection, { SettingsStack } from '../components/SettingsSection'
import { apiErrorMessage } from '../utils/format'
import { BOARD_VIEW_OPTIONS, DENSITY_OPTIONS } from '../utils/preferences'

const DENSITY_LABELS = {
  comfortable: 'setDensityComfortable',
  compact: 'setDensityCompact'
}

function AppearanceTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary } = useTranslation()

  const userPrefs = currentUser?.preferences || {}
  const [prefs, setPrefs] = useState({
    density: DENSITY_OPTIONS.includes(userPrefs.density) ? userPrefs.density : 'comfortable',
    defaultBoardView: BOARD_VIEW_OPTIONS.includes(userPrefs.defaultBoardView) ? userPrefs.defaultBoardView : 'kanban',
    reduceMotion: Boolean(userPrefs.reduceMotion),
    sound: userPrefs.sound !== false
  })

  useEffect(() => {
    const saved = currentUser?.preferences || {}
    setPrefs({
      density: DENSITY_OPTIONS.includes(saved.density) ? saved.density : 'comfortable',
      defaultBoardView: BOARD_VIEW_OPTIONS.includes(saved.defaultBoardView) ? saved.defaultBoardView : 'kanban',
      reduceMotion: Boolean(saved.reduceMotion),
      sound: saved.sound !== false
    })
  }, [currentUser?.preferences])

  const applyPreferencePatch = async (patch) => {
    const nextPrefs = { ...prefs, ...patch }
    setPrefs(nextPrefs)
    try {
      const res = await updatePreferencesAPI(patch)
      const nextUser = res?.user || res
      if (nextUser && typeof nextUser === 'object') {
        dispatch(setCurrentUser(nextUser))
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    }
  }

  return (
    <SettingsStack maxWidth={960}>
      <SettingsSection
        index={1}
        label={tPrimary('tabAppearance')}
        title={t('setAppearancePrefsTitle')}
      >
        <Stack spacing={2.25}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              {tPrimary('setDensityLabel')}
            </Typography>
            <Stack direction='row' spacing={1}>
              {DENSITY_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={tPrimary(DENSITY_LABELS[option])}
                  color={prefs.density === option ? 'primary' : 'default'}
                  variant={prefs.density === option ? 'filled' : 'outlined'}
                  onClick={() => applyPreferencePatch({ density: option })}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              {tPrimary('setDefaultViewLabel')}
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {BOARD_VIEW_OPTIONS.map((view) => (
                <Chip
                  key={view}
                  label={view.charAt(0).toUpperCase() + view.slice(1)}
                  color={prefs.defaultBoardView === view ? 'primary' : 'default'}
                  variant={prefs.defaultBoardView === view ? 'filled' : 'outlined'}
                  onClick={() => applyPreferencePatch({ defaultBoardView: view })}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              {tPrimary('setReduceMotionLabel')}
            </Typography>
            <Switch
              checked={prefs.reduceMotion}
              onChange={(e) => applyPreferencePatch({ reduceMotion: e.target.checked })}
              inputProps={{ 'aria-label': tPrimary('setReduceMotionLabel') }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              {tPrimary('setSoundLabel')}
            </Typography>
            <Switch
              checked={prefs.sound}
              onChange={(e) => applyPreferencePatch({ sound: e.target.checked })}
              inputProps={{ 'aria-label': tPrimary('setSoundLabel') }}
            />
          </Box>
        </Stack>
      </SettingsSection>

      <FxSettingsPanel />
    </SettingsStack>
  )
}

export default AppearanceTab
