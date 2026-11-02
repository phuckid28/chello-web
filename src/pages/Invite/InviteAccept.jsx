import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import { toast } from 'react-toastify'
import PageShell from '~/components/Layout/PageShell'
import { surfaceSx } from '~/components/Layout/surface'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { fetchInviteAPI, acceptInviteAPI } from '~/apis'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { fetchWorkspaceTree } from '~/redux/workspaces/workspacesSlice'
import { roleLabelKey } from '~/utils/workspaceTree'
import { useTranslation } from '~/customHooks/useTranslation'

function InviteAccept() {
  const { token } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { tPrimary, formatMessage } = useTranslation()

  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    if (!token) {
      setInvalid(true)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setInvalid(false)
    fetchInviteAPI(token)
      .then((res) => {
        if (cancelled) return
        const payload = res?.invite || res
        if (!payload) setInvalid(true)
        else setInvite(payload)
      })
      .catch((err) => {
        if (cancelled) return
        if (err?.response?.status === 410) {
          setInvite({ expired: true })
        } else {
          setInvalid(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (loading) {
    return <PageLoadingSpinner caption={tPrimary('v7Loading')} />
  }

  const isExpired = Boolean(
    invite?.expired || (invite?.expiresAt && Number(invite.expiresAt) <= Date.now())
  )

  if (invalid || !invite) {
    return (
      <PageShell
        eyebrow={tPrimary('wsInviteScopeWorkspace')}
        title={tPrimary('wsInviteInvalidTitle')}
        subtitle={tPrimary('wsInviteInvalidBody')}
        maxWidth={560}
      >
        <Box sx={surfaceSx}>
          <Button
            component={Link}
            to='/boards'
            variant='contained'
            startIcon={<ArrowBackRoundedIcon />}
          >
            {tPrimary('wsBackToBoards')}
          </Button>
        </Box>
      </PageShell>
    )
  }

  if (isExpired) {
    return (
      <PageShell
        eyebrow={tPrimary('wsInviteScopeWorkspace')}
        title={tPrimary('wsInviteExpiredTitle')}
        subtitle={tPrimary('wsInviteExpiredBody')}
        maxWidth={560}
      >
        <Box sx={surfaceSx}>
          <Button
            component={Link}
            to='/boards'
            variant='contained'
            startIcon={<ArrowBackRoundedIcon />}
          >
            {tPrimary('wsBackToBoards')}
          </Button>
        </Box>
      </PageShell>
    )
  }

  const scope = invite.scope || 'workspace'
  const scopeLabel = scope === 'board'
    ? tPrimary('wsInviteScopeBoard')
    : tPrimary('wsInviteScopeWorkspace')
  const targetName = invite.name
    || invite.targetName
    || invite.workspace?.name
    || invite.board?.title
    || scopeLabel
  const inviterName = invite.inviter?.displayName
    || invite.inviter?.username
    || invite.invitedBy?.displayName
    || ''
  const roleKey = roleLabelKey(invite.role || 'member')

  const handleAccept = async () => {
    if (!token || accepting) return
    setAccepting(true)
    try {
      const res = await acceptInviteAPI(token)
      toast.success(tPrimary('wsInviteAccepted'))
      const finalScope = res?.scope || scope
      const finalScopeId = res?.scopeId || res?.workspaceId || res?.boardId || invite.scopeId
      if (finalScope === 'workspace') {
        dispatch(fetchWorkspaceTree())
        navigate(finalScopeId ? `/workspaces/${finalScopeId}` : '/boards')
      } else {
        navigate(finalScopeId ? `/boards/${finalScopeId}` : '/boards')
      }
    } finally {
      setAccepting(false)
    }
  }

  return (
    <PageShell
      eyebrow={scopeLabel}
      title={tPrimary('wsInviteTitle')}
      maxWidth={560}
    >
      <Box sx={surfaceSx}>
        <Stack spacing={2.5}>
          <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
            <Chip size='small' color='primary' label={scopeLabel} sx={{ fontWeight: 700 }} />
            {roleKey && (
              <Chip
                size='small'
                variant='outlined'
                label={`${tPrimary('wsInviteAsRole')}: ${tPrimary(roleKey)}`}
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>

          <Box>
            <Typography variant='h5' sx={{ fontWeight: 800 }}>
              {targetName}
            </Typography>
            {inviterName && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                {formatMessage('wsInviteInvitedBy', { name: inviterName })}
              </Typography>
            )}
          </Box>

          {!currentUser ? (
            <Stack spacing={1.5}>
              <Typography variant='body2' color='text.secondary'>
                {tPrimary('wsInviteLoginPrompt')}
              </Typography>
              <Stack direction='row' spacing={1.5} flexWrap='wrap'>
                <Button
                  component={Link}
                  to='/login'
                  variant='contained'
                  startIcon={<LoginRoundedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {tPrimary('wsInviteLogin')}
                </Button>
                <Button
                  component={Link}
                  to='/register'
                  variant='outlined'
                  startIcon={<PersonAddAltRoundedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {tPrimary('wsInviteRegister')}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack direction='row' spacing={1.5} flexWrap='wrap'>
              <Button
                variant='contained'
                startIcon={<CheckCircleOutlineRoundedIcon />}
                onClick={handleAccept}
                disabled={accepting}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {tPrimary('wsInviteAccept')}
              </Button>
              <Button
                component={Link}
                to='/boards'
                variant='text'
                disabled={accepting}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {tPrimary('wsInviteLater')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>
    </PageShell>
  )
}

export default InviteAccept
