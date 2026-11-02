import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import WallpaperOutlinedIcon from '@mui/icons-material/WallpaperOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { updateProfileAPI, updateUsernameAPI, uploadUserImageAPI } from '~/apis'
import soraAvatar from '~/assets/sora.jpg'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import { ACCEPTED_IMAGE_TYPES, prepareImageUpload } from '~/utils/imageResize'
import SettingsSection, { SettingsStack } from '../components/SettingsSection'
import { apiErrorCode, apiErrorMessage, apiErrorStatus, formatDate, weekdayLabel } from '../utils/format'
import {
  PROFILE_LIMITS, PROFILE_LOCALES, WEEKDAYS, buildProfileForm, buildProfilePayload,
  getTimezones, guessTimezone, nextUsernameChangeAt, normalizeSkills, usernameError, validateProfileForm
} from '../utils/profileForm'

const LOCALE_NAMES = { vi: 'Tiếng Việt (vi)', en: 'English (en)', ja: '日本語 (ja)', ko: '한국어 (ko)' }

function ProfileTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary, formatMessage, lang } = useTranslation()
  const { themeConfig } = usePersonaTheme()

  const [uploadingKind, setUploadingKind] = useState('')
  const [driveUnavailable, setDriveUnavailable] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const [username, setUsername] = useState(currentUser?.username || '')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameApiErr, setUsernameApiErr] = useState('')

  const [form, setForm] = useState(() => buildProfileForm(currentUser))
  const [errors, setErrors] = useState({})
  const [skillInput, setSkillInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    setUsername(currentUser?.username || '')
    setForm(buildProfileForm(currentUser))
  }, [currentUser])

  const timezones = useMemo(() => getTimezones(), [])
  const nextAllowed = nextUsernameChangeAt(currentUser?.usernameChangedAt)
  const unameErrKey = usernameError(username, currentUser?.username)

  const applyUserResponse = (res) => {
    const nextUser = res?.user || res
    if (nextUser && typeof nextUser === 'object') dispatch(setCurrentUser(nextUser))
  }

  const handleFileChange = async (kind, event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError('')
    setUploadingKind(kind)
    let prepared = null
    try {
      prepared = await prepareImageUpload(file, kind)
      const res = await uploadUserImageAPI({
        kind, fileName: prepared.fileName, mimeType: prepared.mimeType, base64: prepared.base64
      })
      applyUserResponse(res)
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      if (apiErrorCode(err) === 'DRIVE_NOT_CONFIGURED' || apiErrorStatus(err) === 503) {
        setDriveUnavailable(true)
      } else if (err?.code) {
        setPhotoError(tPrimary('setPhotoInvalid'))
      } else {
        setPhotoError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
      }
    } finally {
      if (prepared?.previewUrl) URL.revokeObjectURL(prepared.previewUrl)
      setUploadingKind('')
    }
  }

  const handleRemovePhoto = async (field) => {
    setPhotoError('')
    setUploadingKind(field)
    try {
      const res = await updateProfileAPI({ [field]: null })
      applyUserResponse(res)
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      setPhotoError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setUploadingKind('')
    }
  }

  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    if (nextAllowed || unameErrKey) return
    setUsernameSaving(true)
    setUsernameApiErr('')
    try {
      const res = await updateUsernameAPI(username.trim())
      applyUserResponse(res)
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      setUsernameApiErr(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setUsernameSaving(false)
    }
  }

  const toggleWorkday = (day) => {
    const days = form.workingHours.days.includes(day)
      ? form.workingHours.days.filter((d) => d !== day)
      : [...form.workingHours.days, day].sort((a, b) => a - b)
    setForm((prev) => ({ ...prev, workingHours: { ...prev.workingHours, days } }))
  }

  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    setForm((prev) => ({ ...prev, skills: normalizeSkills([...prev.skills, trimmed]) }))
    setSkillInput('')
  }

  const handleRemoveSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))
  }

  const updateSocialRow = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    }))
  }

  const addSocialRow = () => {
    if (form.socialLinks.length >= PROFILE_LIMITS.socialLinks) return
    setForm((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, { label: '', url: '' }] }))
  }

  const removeSocialRow = (index) => {
    setForm((prev) => ({ ...prev, socialLinks: prev.socialLinks.filter((_, idx) => idx !== index) }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validateProfileForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setSavingProfile(true)
    try {
      const res = await updateProfileAPI(buildProfilePayload(form))
      applyUserResponse(res)
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      toast.error(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <SettingsStack>
      <SettingsSection index={1} label={tPrimary('setTabProfile')} title={t('setPhotosTitle')} description={tPrimary('setPhotosDesc')}>
        {driveUnavailable && <Alert severity='warning' sx={{ mb: 2 }}>{tPrimary('setDriveNotConfigured')}</Alert>}
        {photoError && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setPhotoError('')}>{photoError}</Alert>}

        <Box
          sx={{
            position: 'relative', height: 132, borderRadius: '12px', overflow: 'hidden',
            border: `1px solid ${themeConfig.columnBorder}`,
            background: currentUser?.bannerUrl
              ? `center / cover no-repeat url(${currentUser.bannerUrl})`
              : `linear-gradient(135deg, ${themeConfig.accentColor}33, ${themeConfig.secondaryAccent}22)`,
            mb: 5
          }}
        >
          <Avatar
            src={currentUser?.avatar || soraAvatar}
            alt={currentUser?.displayName}
            sx={{
              width: 76, height: 76, position: 'absolute', left: 20, bottom: -28,
              border: `3px solid ${themeConfig.accentColor}`, boxShadow: '0 6px 18px rgba(0,0,0,0.22)'
            }}
          />
        </Box>

        <Stack direction='row' spacing={1.25} flexWrap='wrap' useFlexGap>
          <Button component='label' variant='outlined' size='small' disabled={Boolean(uploadingKind)} startIcon={<PhotoCameraOutlinedIcon />}>
            {tPrimary('setUploadAvatar')}
            <input hidden type='file' accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={(e) => handleFileChange('avatar', e)} />
          </Button>
          {currentUser?.avatar && (
            <Button variant='text' color='error' size='small' disabled={Boolean(uploadingKind)} onClick={() => handleRemovePhoto('avatar')}>
              {tPrimary('setRemoveAvatar')}
            </Button>
          )}
          <Button component='label' variant='outlined' size='small' disabled={Boolean(uploadingKind)} startIcon={<WallpaperOutlinedIcon />}>
            {tPrimary('setUploadBanner')}
            <input hidden type='file' accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={(e) => handleFileChange('banner', e)} />
          </Button>
          {currentUser?.bannerUrl && (
            <Button variant='text' color='error' size='small' disabled={Boolean(uploadingKind)} onClick={() => handleRemovePhoto('bannerUrl')}>
              {tPrimary('setRemoveBanner')}
            </Button>
          )}
        </Stack>
      </SettingsSection>

      <SettingsSection index={2} label={tPrimary('setTabProfile')} title={t('setUsernameTitle')} description={tPrimary('setUsernameDesc')}>
        {nextAllowed && (
          <Alert severity='info' sx={{ mb: 2 }}>
            {formatMessage('setUsernameCooldown', { date: formatDate(nextAllowed, lang) })}
          </Alert>
        )}
        {usernameApiErr && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setUsernameApiErr('')}>{usernameApiErr}</Alert>}
        <Box component='form' onSubmit={handleUsernameSubmit} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <TextField
            size='small'
            sx={{ flex: '1 1 240px' }}
            value={username}
            disabled={Boolean(nextAllowed) || usernameSaving}
            onChange={(e) => setUsername(e.target.value)}
            label={tPrimary('yourUsernameLabel')}
            error={Boolean(username !== (currentUser?.username || '') && unameErrKey)}
            helperText={username !== (currentUser?.username || '') && unameErrKey ? tPrimary(unameErrKey) : ' '}
            InputProps={{ startAdornment: <InputAdornment position='start'>@</InputAdornment> }}
          />
          <Button type='submit' variant='contained' disabled={Boolean(nextAllowed) || Boolean(unameErrKey) || usernameSaving} sx={{ fontWeight: 700, mt: 0.25 }}>
            {usernameSaving ? tPrimary('v7Saving') : tPrimary('v7Save')}
          </Button>
        </Box>
      </SettingsSection>

      <SettingsSection index={3} label={tPrimary('setTabProfile')} title={t('setProfileDetailsTitle')} description={tPrimary('setProfileDetailsDesc')}>
        <Box component='form' onSubmit={handleProfileSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth label={tPrimary('yourDisplayNameLabel')} value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
              error={Boolean(errors.displayName)}
              helperText={errors.displayName ? tPrimary(errors.displayName) : `${form.displayName.length}/${PROFILE_LIMITS.displayName}`}
            />
            <TextField
              fullWidth label={tPrimary('setJobTitleLabel')} value={form.jobTitle}
              onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
              error={Boolean(errors.jobTitle)}
              helperText={errors.jobTitle ? tPrimary(errors.jobTitle) : `${form.jobTitle.length}/${PROFILE_LIMITS.jobTitle}`}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth label={tPrimary('setDepartmentLabel')} value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              error={Boolean(errors.department)}
              helperText={errors.department ? tPrimary(errors.department) : `${form.department.length}/${PROFILE_LIMITS.department}`}
            />
            <TextField
              select fullWidth label={tPrimary('setLocaleLabel')} value={form.locale}
              onChange={(e) => setForm((prev) => ({ ...prev, locale: e.target.value }))}
            >
              <MenuItem value=''>—</MenuItem>
              {PROFILE_LOCALES.map((loc) => <MenuItem key={loc} value={loc}>{LOCALE_NAMES[loc] || loc}</MenuItem>)}
            </TextField>
          </Box>

          <TextField
            fullWidth multiline minRows={3} label={tPrimary('setBioLabel')} value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            error={Boolean(errors.bio)}
            helperText={errors.bio ? tPrimary(errors.bio) : `${form.bio.length}/${PROFILE_LIMITS.bio}`}
          />

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              select size='small' sx={{ flex: '1 1 240px' }} label={tPrimary('setTimezoneLabel')} value={form.timezone}
              onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
            >
              <MenuItem value=''>—</MenuItem>
              {timezones.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
            </TextField>
            <Button
              size='small' variant='outlined' startIcon={<MyLocationRoundedIcon />}
              onClick={() => {
                const detected = guessTimezone()
                if (detected) setForm((prev) => ({ ...prev, timezone: detected }))
              }}
            >
              {tPrimary('setUseBrowserTz')}
            </Button>
          </Box>

          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>{tPrimary('setWorkingHoursLabel')}</Typography>
            <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap' useFlexGap sx={{ mb: 1.25 }}>
              <TextField
                size='small' type='time' value={form.workingHours.start}
                onChange={(e) => setForm((prev) => ({ ...prev, workingHours: { ...prev.workingHours, start: e.target.value } }))}
                inputProps={{ step: 300 }}
              />
              <Typography variant='body2' color='text.secondary'>–</Typography>
              <TextField
                size='small' type='time' value={form.workingHours.end}
                onChange={(e) => setForm((prev) => ({ ...prev, workingHours: { ...prev.workingHours, end: e.target.value } }))}
                inputProps={{ step: 300 }}
              />
            </Stack>
            <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
              {WEEKDAYS.map((day) => {
                const active = form.workingHours.days.includes(day)
                return (
                  <Chip
                    key={day} label={weekdayLabel(day, lang)} color={active ? 'primary' : 'default'}
                    variant={active ? 'filled' : 'outlined'} onClick={() => toggleWorkday(day)} sx={{ fontWeight: 700 }}
                  />
                )
              })}
            </Stack>
            {errors.workingHours && <Typography variant='caption' color='error' sx={{ display: 'block', mt: 0.75 }}>{tPrimary(errors.workingHours)}</Typography>}
          </Box>

          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
              {tPrimary('profSkills')} ({form.skills.length}/{PROFILE_LIMITS.skills})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size='small' fullWidth placeholder={tPrimary('setSkillsPlaceholder')} value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill() } }}
              />
              <Button variant='outlined' size='small' onClick={handleAddSkill} disabled={form.skills.length >= PROFILE_LIMITS.skills}>
                {tPrimary('addBtn')}
              </Button>
            </Box>
            <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
              {form.skills.map((skill) => <Chip key={skill} label={skill} size='small' onDelete={() => handleRemoveSkill(skill)} />)}
            </Stack>
            {errors.skills && <Typography variant='caption' color='error' sx={{ display: 'block', mt: 0.75 }}>{tPrimary(errors.skills)}</Typography>}
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                {tPrimary('profLinks')} ({form.socialLinks.length}/{PROFILE_LIMITS.socialLinks})
              </Typography>
              <Button size='small' startIcon={<AddRoundedIcon />} onClick={addSocialRow} disabled={form.socialLinks.length >= PROFILE_LIMITS.socialLinks}>
                {tPrimary('setSocialAdd')}
              </Button>
            </Box>
            <Stack spacing={1.25}>
              {form.socialLinks.map((row, index) => {
                const rowErr = errors.socialLinks?.[index]
                return (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <TextField
                      size='small' label={tPrimary('setSocialLabelField')} value={row.label}
                      onChange={(e) => updateSocialRow(index, 'label', e.target.value)} sx={{ flex: '1 1 140px' }}
                    />
                    <TextField
                      size='small' label='https://' value={row.url}
                      onChange={(e) => updateSocialRow(index, 'url', e.target.value)}
                      error={Boolean(rowErr)} helperText={rowErr ? tPrimary(rowErr) : ''} sx={{ flex: '2 1 220px' }}
                    />
                    <IconButton size='small' color='error' onClick={() => removeSocialRow(index)} sx={{ mt: 0.5 }}>
                      <DeleteOutlineRoundedIcon fontSize='small' />
                    </IconButton>
                  </Box>
                )
              })}
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
            <Button type='submit' variant='contained' disabled={savingProfile} sx={{ px: 3.5, fontWeight: 800 }}>
              {savingProfile ? tPrimary('v7Saving') : tPrimary('v7Save')}
            </Button>
          </Box>
        </Box>
      </SettingsSection>
    </SettingsStack>
  )
}

export default ProfileTab
