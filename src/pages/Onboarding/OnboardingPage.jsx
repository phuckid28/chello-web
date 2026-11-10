import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import { toast } from 'react-toastify'
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded'
import PageShell from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { PRIMARY_THEMES_LIST, DEFAULT_SPRINT_TEMPLATE } from '~/utils/animeTheme'
import { runWithReveal } from '~/fx/themeReveal'
import { playUiChime } from '~/utils/soundEffects'
import {
  ONBOARDING_STEPS,
  MAX_INVITE_EMAILS,
  INVITE_ROLES,
  WORKSPACE_ICONS,
  nextStep,
  buildOnboardingPatch,
  parseInviteEmails,
  validateWorkspaceName
} from '~/utils/onboarding'
import { selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import { createWorkspace, selectWorkspace } from '~/redux/workspaces/workspacesSlice'
import {
  updatePreferencesAPI,
  inviteToWorkspaceByEmailAPI,
  createWorkspaceInviteLinkAPI,
  createNewBoardAPI
} from '~/apis'
import StepHeading from './StepHeading'
import { optionCardSx, optionGridSx } from './onboardingStyles'

const SWATCH_COLORS = ['#38bdf8', '#10b981', '#a78bfa', '#ec4899', '#e5c058', '#0284c7', '#f97316', '#6366f1']
const STEP_LABEL_KEYS = { theme: 'onbStepTheme', language: 'onbStepLanguage', workspace: 'onbStepWorkspace', invite: 'onbStepInvite' }
const ROLE_LABEL_KEYS = { member: 'v7RoleMember', admin: 'v7RoleAdmin', viewer: 'v7RoleViewer' }
const NAME_ERR_KEYS = { required: 'onbNameRequired', tooShort: 'onbNameTooShort', tooLong: 'onbNameTooLong' }

function OnboardingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const { lang, bilingual, languages, changeLanguage, toggleBilingual, tPrimary, formatMessage } = useTranslation()
  const { personaKey, themeConfig, changePersona } = usePersonaTheme()

  const headingRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)
  const [stepsState, setStepsState] = useState({ theme: true, language: true, workspace: false, invite: false })
  const [finishing, setFinishing] = useState(false)

  const [wsName, setWsName] = useState('')
  const [wsIcon, setWsIcon] = useState(WORKSPACE_ICONS[0])
  const [wsColor, setWsColor] = useState(SWATCH_COLORS[0])
  const [wsNameError, setWsNameError] = useState('')
  const [wsCreating, setWsCreating] = useState(false)
  const [createdWorkspace, setCreatedWorkspace] = useState(null)

  const [inviteText, setInviteText] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteResults, setInviteResults] = useState([])
  const [inviteLinkUrl, setInviteLinkUrl] = useState('')
  const [linkCreating, setLinkCreating] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    headingRef.current?.focus?.()
  }, [activeStep])

  const completeOnboarding = async (nextSteps = stepsState, targetPath = '/boards') => {
    setFinishing(true)
    const patch = buildOnboardingPatch(nextSteps, true)
    try {
      const user = await updatePreferencesAPI(patch)
      if (user?._id) dispatch(setCurrentUser(user))
      else if (currentUser) dispatch(setCurrentUser({ ...currentUser, preferences: { ...(currentUser.preferences || {}), ...patch } }))
    } catch {
      toast.warning(tPrimary('onbSaveFailed'))
    } finally {
      setFinishing(false)
      navigate(targetPath)
    }
  }

  // Minimum Path to Value (<30s): 1-click launch a full sample Sprint board with seeded BNPL-945/946/947 CRs & FRDs
  const handleQuickLaunchSampleSprint = async () => {
    setFinishing(true)
    playUiChime('complete')
    try {
      const createdBoard = await createNewBoardAPI({
        title: 'Sprint 01 • Quản lý CR & Đặc tả FRD',
        description: DEFAULT_SPRINT_TEMPLATE.description,
        type: 'public',
        theme: personaKey,
        useTemplate: true,
        ...(createdWorkspace?._id ? { workspaceId: createdWorkspace._id } : {})
      })
      const targetUrl = createdBoard?._id ? `/boards/${createdBoard._id}` : '/boards?create=1'
      await completeOnboarding({ ...stepsState, theme: true, language: true }, targetUrl)
    } catch {
      await completeOnboarding(stepsState, '/boards?create=1')
    }
  }

  const advanceFrom = (stepIdx, wsId = createdWorkspace?._id, updatedSteps = stepsState) => {
    const candidate = nextStep({ activeStep: stepIdx, workspaceId: wsId })
    if (candidate >= ONBOARDING_STEPS.length) completeOnboarding(updatedSteps)
    else setActiveStep(candidate)
  }

  const handleCreateWorkspace = async (event) => {
    event.preventDefault()
    const code = validateWorkspaceName(wsName)
    if (code) {
      setWsNameError(tPrimary(NAME_ERR_KEYS[code]))
      return
    }
    setWsNameError('')
    setWsCreating(true)
    try {
      const action = await dispatch(createWorkspace({ name: wsName.trim(), icon: wsIcon, color: wsColor }))
      if (action.error) return
      const created = action.payload
      if (created?._id) {
        setCreatedWorkspace(created)
        dispatch(selectWorkspace(created._id))
      }
      toast.success(formatMessage('onbWorkspaceCreated', { name: wsName.trim() }))
      const nextSteps = { ...stepsState, workspace: true }
      setStepsState(nextSteps)
      advanceFrom(activeStep, created?._id || 'created', nextSteps)
    } finally {
      setWsCreating(false)
    }
  }

  const parsedInvites = parseInviteEmails(inviteText, {
    max: MAX_INVITE_EMAILS,
    exclude: currentUser?.email ? [currentUser.email] : []
  })

  const handleSendInvites = async () => {
    if (!createdWorkspace?._id || parsedInvites.valid.length === 0) return
    setInviteSending(true)
    const outcomes = []
    for (const email of parsedInvites.valid) {
      try {
        await inviteToWorkspaceByEmailAPI(createdWorkspace._id, { email, role: inviteRole })
        outcomes.push({ email, ok: true })
      } catch {
        outcomes.push({ email, ok: false })
      }
    }
    setInviteResults(outcomes)
    setInviteSending(false)
    const sentCount = outcomes.filter((r) => r.ok).length
    if (sentCount > 0) {
      setStepsState((prev) => ({ ...prev, invite: true }))
      toast.success(formatMessage('onbInviteSummary', { sent: sentCount, total: outcomes.length }))
    }
  }

  const handleCreateInviteLink = async () => {
    if (!createdWorkspace?._id) return
    setLinkCreating(true)
    try {
      const res = await createWorkspaceInviteLinkAPI(createdWorkspace._id, { role: inviteRole, expiresInHours: 168 })
      const token = res?.token || res?.code || ''
      const url = res?.url || (token ? `${window.location.origin}/invite/${token}` : '')
      setInviteLinkUrl(url)
      setStepsState((prev) => ({ ...prev, invite: true }))
    } finally {
      setLinkCreating(false)
    }
  }

  const handleCopyInviteLink = async () => {
    if (!inviteLinkUrl) return
    try {
      await navigator.clipboard?.writeText(inviteLinkUrl)
      setLinkCopied(true)
      toast.success(tPrimary('v7Copied'))
    } catch {
      setLinkCopied(false)
    }
  }

  const stepKey = ONBOARDING_STEPS[activeStep] || 'theme'

  return (
    <PageShell
      index={1}
      eyebrow={tPrimary('onbEyebrow')}
      title={tPrimary('onbTitle')}
      subtitle={tPrimary('onbSubtitle')}
      maxWidth={880}
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            size='small'
            color='secondary'
            startIcon={<RocketLaunchRoundedIcon fontSize='small' />}
            disabled={finishing}
            onClick={handleQuickLaunchSampleSprint}
            sx={{ fontWeight: 800 }}
          >
            ⚡ Khởi tạo nhanh Sprint mẫu (30s)
          </Button>
          <Button variant='outlined' size='small' disabled={finishing} onClick={() => completeOnboarding(stepsState)} sx={{ fontWeight: 700 }}>
            {tPrimary('onbSkipAll')}
          </Button>
        </Box>
      }
    >
      <Box sx={{ mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {ONBOARDING_STEPS.map((key) => (
            <Step key={key} completed={Boolean(stepsState[key]) && ONBOARDING_STEPS.indexOf(key) < activeStep}>
              <StepLabel>{tPrimary(STEP_LABEL_KEYS[key])}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Typography variant='caption' sx={{ display: 'block', textAlign: 'center', mt: 1, fontFamily: MONO_FONT, color: 'text.secondary' }}>
          {formatMessage('onbStepOf', { current: activeStep + 1, total: ONBOARDING_STEPS.length })}
        </Typography>
      </Box>

      <Box sx={surfaceSx}>
        {stepKey === 'theme' && (
          <Box>
            <StepHeading ref={headingRef} index={1} label={tPrimary('onbStepTheme')} title={tPrimary('onbThemeTitle')} subtitle={tPrimary('onbThemeSub')} />
            <Box sx={optionGridSx(220)} role='radiogroup' aria-label={tPrimary('onbThemeTitle')}>
              {PRIMARY_THEMES_LIST.map((theme) => {
                const selected = personaKey === theme.id
                return (
                  <ButtonBase
                    key={theme.id}
                    role='radio'
                    aria-checked={selected}
                    aria-label={formatMessage('onbThemeSelect', { name: theme.name })}
                    onClick={(e) => {
                      playUiChime('theme')
                      runWithReveal(e, () => changePersona(theme.id))
                      setStepsState((prev) => ({ ...prev, theme: true }))
                    }}
                    sx={{ ...optionCardSx(selected, theme.accentColor), p: 1.5, display: 'block' }}
                  >
                    <Box sx={{ height: 64, borderRadius: '8px', mb: 1, backgroundImage: `url("${theme.heroImage}")`, backgroundSize: 'cover', backgroundPosition: 'center', border: `1px solid ${theme.columnBorder}` }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant='subtitle2' sx={{ fontWeight: 800, fontSize: '0.84rem' }}>{theme.name}</Typography>
                      {selected && <Chip size='small' label={tPrimary('onbThemeActive')} sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800 }} />}
                    </Box>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25 }}>{theme.archetypeLabel}</Typography>
                  </ButtonBase>
                )
              })}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant='contained' onClick={() => setActiveStep(1)} sx={{ fontWeight: 800 }}>{tPrimary('v7Next')}</Button>
            </Box>
          </Box>
        )}

        {stepKey === 'language' && (
          <Box>
            <StepHeading ref={headingRef} index={2} label={tPrimary('onbStepLanguage')} title={tPrimary('onbLanguageTitle')} subtitle={tPrimary('onbLanguageSub')} />
            <Box sx={optionGridSx(180)} role='radiogroup' aria-label={tPrimary('onbLanguageTitle')}>
              {languages.map((item) => {
                const selected = lang === item.code
                return (
                  <ButtonBase
                    key={item.code}
                    role='radio'
                    aria-checked={selected}
                    onClick={() => {
                      changeLanguage(item.code)
                      setStepsState((prev) => ({ ...prev, language: true }))
                    }}
                    sx={{ ...optionCardSx(selected, themeConfig.accentColor), p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <Typography component='span' sx={{ fontSize: '1.5rem' }} aria-hidden='true'>{item.flag}</Typography>
                    <Box>
                      <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>{item.nativeName}</Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>{item.short}</Typography>
                    </Box>
                  </ButtonBase>
                )
              })}
            </Box>

            <Box sx={{ mt: 2.5, p: 2, borderRadius: '12px', border: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>{tPrimary('onbBilingual')}</Typography>
                <Typography variant='caption' color='text.secondary'>{tPrimary('onbBilingualSub')}</Typography>
              </Box>
              <Switch checked={bilingual} onChange={toggleBilingual} inputProps={{ 'aria-label': tPrimary('onbBilingual') }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button variant='outlined' onClick={() => setActiveStep(0)} sx={{ fontWeight: 700 }}>{tPrimary('v7Back')}</Button>
              <Button variant='contained' onClick={() => setActiveStep(2)} sx={{ fontWeight: 800 }}>{tPrimary('v7Next')}</Button>
            </Box>
          </Box>
        )}

        {stepKey === 'workspace' && (
          <Box component='form' onSubmit={handleCreateWorkspace} noValidate>
            <StepHeading ref={headingRef} index={3} label={`${tPrimary('onbStepWorkspace')} • ${tPrimary('onbOptional')}`} title={tPrimary('onbWorkspaceTitle')} subtitle={tPrimary('onbWorkspaceSub')} />
            <TextField
              autoFocus
              fullWidth
              label={tPrimary('onbWorkspaceName')}
              helperText={wsNameError || tPrimary('onbWorkspaceNameHint')}
              error={Boolean(wsNameError)}
              value={wsName}
              onChange={(e) => {
                setWsName(e.target.value)
                if (wsNameError) setWsNameError('')
              }}
              sx={{ mb: 2.5 }}
            />

            <Typography variant='caption' sx={{ fontWeight: 800, display: 'block', mb: 1 }}>{tPrimary('onbWorkspaceIcon')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }} role='radiogroup' aria-label={tPrimary('onbWorkspaceIcon')}>
              {WORKSPACE_ICONS.map((icon) => (
                <ButtonBase
                  key={icon}
                  role='radio'
                  aria-checked={wsIcon === icon}
                  aria-label={formatMessage('onbWorkspaceIconPick', { icon })}
                  onClick={() => setWsIcon(icon)}
                  sx={{ ...optionCardSx(wsIcon === icon, wsColor), width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}
                >
                  {icon}
                </ButtonBase>
              ))}
            </Box>

            <Typography variant='caption' sx={{ fontWeight: 800, display: 'block', mb: 1 }}>{tPrimary('onbWorkspaceColor')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} role='radiogroup' aria-label={tPrimary('onbWorkspaceColor')}>
              {SWATCH_COLORS.map((color) => (
                <ButtonBase
                  key={color}
                  role='radio'
                  aria-checked={wsColor === color}
                  aria-label={formatMessage('onbWorkspaceColorPick', { color })}
                  onClick={() => setWsColor(color)}
                  sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: color, border: wsColor === color ? '3px solid #ffffff' : '1px solid rgba(0,0,0,0.2)', boxShadow: wsColor === color ? `0 0 0 2px ${color}` : 'none' }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mt: 3 }}>
              <Button variant='outlined' onClick={() => setActiveStep(1)} sx={{ fontWeight: 700 }}>{tPrimary('v7Back')}</Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant='text' disabled={wsCreating || finishing} onClick={() => advanceFrom(activeStep, null, stepsState)} sx={{ fontWeight: 700 }}>
                  {tPrimary('onbWorkspaceLater')}
                </Button>
                <Button type='submit' variant='contained' disabled={wsCreating} sx={{ fontWeight: 800 }}>
                  {wsCreating ? tPrimary('onbWorkspaceCreating') : tPrimary('onbWorkspaceCreate')}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {stepKey === 'invite' && (
          <Box>
            <StepHeading ref={headingRef} index={4} label={`${tPrimary('onbStepInvite')} • ${tPrimary('onbOptional')}`} title={tPrimary('onbInviteTitle')} subtitle={tPrimary('onbInviteSub')} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 180px' }, gap: 1.5 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label={tPrimary('onbInviteEmails')}
                helperText={formatMessage('onbInviteEmailsHint', { max: MAX_INVITE_EMAILS })}
                value={inviteText}
                onChange={(e) => setInviteText(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel id='onb-invite-role-label'>{tPrimary('onbInviteRole')}</InputLabel>
                <Select labelId='onb-invite-role-label' label={tPrimary('onbInviteRole')} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  {INVITE_ROLES.map((role) => (
                    <MenuItem key={role} value={role}>{tPrimary(ROLE_LABEL_KEYS[role])}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {parsedInvites.invalid.length > 0 && (
              <Alert severity='warning' sx={{ mt: 1.5 }}>{formatMessage('onbInviteInvalid', { list: parsedInvites.invalid.join(', ') })}</Alert>
            )}
            {parsedInvites.excluded.length > 0 && <Alert severity='info' sx={{ mt: 1 }}>{tPrimary('onbInviteSelf')}</Alert>}
            {parsedInvites.overLimit && (
              <Alert severity='warning' sx={{ mt: 1 }}>{formatMessage('onbInviteOverLimit', { max: MAX_INVITE_EMAILS })}</Alert>
            )}

            <Box sx={{ mt: 1.5 }}>
              <Button variant='contained' disabled={inviteSending || parsedInvites.valid.length === 0} onClick={handleSendInvites} sx={{ fontWeight: 800 }}>
                {inviteSending ? tPrimary('onbInviteSending') : formatMessage('onbInviteSend', { count: parsedInvites.valid.length })}
              </Button>
            </Box>

            {inviteResults.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                {inviteResults.map((res) => (
                  <Chip key={res.email} size='small' color={res.ok ? 'success' : 'error'} label={`${res.email}: ${tPrimary(res.ok ? 'onbInviteSent' : 'onbInviteFailed')}`} />
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2.5 }} />
            <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>{tPrimary('onbInviteLinkTitle')}</Typography>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5 }}>{tPrimary('onbInviteLinkSub')}</Typography>

            {inviteLinkUrl ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size='small' fullWidth label={tPrimary('onbInviteLinkLabel')} value={inviteLinkUrl} InputProps={{ readOnly: true }} />
                <Button variant='outlined' onClick={handleCopyInviteLink} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {tPrimary(linkCopied ? 'v7Copied' : 'v7Copy')}
                </Button>
              </Box>
            ) : (
              <Button variant='outlined' disabled={linkCreating} onClick={handleCreateInviteLink} sx={{ fontWeight: 700 }}>
                {tPrimary('onbInviteLinkCreate')}
              </Button>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button variant='outlined' onClick={() => setActiveStep(2)} sx={{ fontWeight: 700 }}>{tPrimary('v7Back')}</Button>
              <Button variant='contained' disabled={finishing} onClick={() => completeOnboarding(stepsState)} sx={{ fontWeight: 800 }}>
                {finishing ? tPrimary('onbFinishing') : tPrimary('onbFinish')}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </PageShell>
  )
}

export default OnboardingPage
