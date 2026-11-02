import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { toast } from 'react-toastify'
import PageShell from '~/components/Layout/PageShell'
import { surfaceSx } from '~/components/Layout/surface'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import PermissionGate from '~/components/Permission/PermissionGate'
import { fetchWorkspaceDetailsAPI } from '~/apis'
import {
  fetchWorkspaceTree,
  updateWorkspace,
  moveWorkspace,
  deleteWorkspace,
  selectWorkspaceTree
} from '~/redux/workspaces/workspacesSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  buildBreadcrumb,
  findNode,
  roleLabelKey,
  inviteLinkRoles,
  getValidMoveTargets,
  canMoveToRoot,
  INDENT_STEP
} from '~/utils/workspaceTree'
import { can } from '~/utils/permissions'
import {
  validateWorkspaceName,
  validateWorkspaceDescription,
  isHexColor,
  isValidDomain,
  addDomain
} from '~/components/Workspace/workspaceValidation'
import { useTranslation } from '~/customHooks/useTranslation'
import WorkspaceHeaderNav, { WorkspaceErrorState } from './WorkspaceHeaderNav'

const COLOR_PRESETS = ['#38bdf8', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

function WorkspaceSettings() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { tPrimary, formatMessage } = useTranslation()

  const currentUser = useSelector(selectCurrentUser)
  const tree = useSelector(selectWorkspaceTree)

  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState(null)

  // General form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🏢')
  const [color, setColor] = useState('#38bdf8')
  const [visibility, setVisibility] = useState('private')
  const [defaultRole, setDefaultRole] = useState('member')
  const [domains, setDomains] = useState([])
  const [domainInput, setDomainInput] = useState('')
  const [domainError, setDomainError] = useState(false)
  const [savingGeneral, setSavingGeneral] = useState(false)

  // Move tree state
  const [selectedParentId, setSelectedParentId] = useState('')
  const [movingWs, setMovingWs] = useState(false)

  // Delete state
  const [confirmName, setConfirmName] = useState('')
  const [deletingWs, setDeletingWs] = useState(false)

  const loadSettings = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setErrorStatus(null)
    try {
      const data = await fetchWorkspaceDetailsAPI(workspaceId)
      setDetails(data)
      const ws = data?.workspace || data
      setName(ws?.name || '')
      setDescription(ws?.description || '')
      setIcon(ws?.icon || '🏢')
      setColor(ws?.color || '#38bdf8')
      setVisibility(ws?.visibility || ws?.settings?.visibility || 'private')
      setDefaultRole(ws?.settings?.defaultRole || ws?.defaultRole || 'member')
      const initDomains = ws?.settings?.allowedEmailDomains || ws?.allowedEmailDomains || []
      setDomains(Array.isArray(initDomains) ? initDomains : [])
      setSelectedParentId(ws?.parentId || '__ROOT__')
      setConfirmName('')
    } catch (err) {
      setErrorStatus(err?.response?.status || 404)
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    dispatch(fetchWorkspaceTree())
  }, [dispatch])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  if (loading) {
    return <PageLoadingSpinner caption={tPrimary('v7Loading')} />
  }

  if (errorStatus || !details) {
    return <WorkspaceErrorState status={errorStatus || 404} />
  }

  const workspace = details?.workspace || details
  const rawCrumb = details?.breadcrumb || workspace?.breadcrumb
  const breadcrumb = Array.isArray(rawCrumb) && rawCrumb.length > 0
    ? rawCrumb
    : buildBreadcrumb(tree, workspaceId)
  const myRole = details?.myRole || workspace?.myRole || findNode(tree, workspaceId)?.myRole || 'member'
  const membersCount = details?.membersCount
    ?? workspace?.membersCount
    ?? (Array.isArray(workspace?.members) ? workspace.members.length : 0)

  const effectiveResource = {
    ...workspace,
    myRole,
    permissions: details?.permissions || workspace?.permissions
  }

  const canManage = can(effectiveResource, 'workspace:manage', currentUser)
  const nameErrorKey = validateWorkspaceName(name)
  const descErrorKey = validateWorkspaceDescription(description)
  const colorValid = isHexColor(color)
  const roleOptions = inviteLinkRoles()

  const validMoveTargets = getValidMoveTargets(
    tree,
    workspaceId,
    (node) => can(node, 'workspace:manage', currentUser)
  )
  const allowRootMove = canMoveToRoot(workspace)
  const hasMoveOptions = allowRootMove || validMoveTargets.length > 0

  const pathLabel = breadcrumb.length > 0
    ? breadcrumb.map((b) => b.name).join(' / ')
    : tPrimary('wsRootLevel')

  const handleAddDomainKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const raw = domainInput.trim()
      if (!raw) return
      if (!isValidDomain(raw)) {
        setDomainError(true)
        return
      }
      setDomains((prev) => addDomain(prev, raw))
      setDomainInput('')
      setDomainError(false)
    }
  }

  const handleRemoveDomain = (target) => {
    setDomains((prev) => prev.filter((d) => d !== target))
  }

  const handleSaveGeneral = async (e) => {
    e.preventDefault()
    if (!canManage || nameErrorKey || descErrorKey || !colorValid || savingGeneral) return
    setSavingGeneral(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim() || '🏢',
        color,
        visibility,
        settings: {
          defaultRole,
          allowedEmailDomains: domains
        }
      }
      await dispatch(updateWorkspace({ workspaceId, data: payload })).unwrap()
      toast.success(tPrimary('wsUpdated'))
      loadSettings()
    } finally {
      setSavingGeneral(false)
    }
  }

  const handleMoveSubmit = async (e) => {
    e.preventDefault()
    if (!canManage || movingWs) return
    const nextParentId = selectedParentId === '__ROOT__' ? null : selectedParentId
    if ((workspace.parentId || null) === nextParentId) return
    setMovingWs(true)
    try {
      await dispatch(moveWorkspace({ workspaceId, parentId: nextParentId })).unwrap()
      toast.success(tPrimary('wsMoved'))
      loadSettings()
    } finally {
      setMovingWs(false)
    }
  }

  const handleDeleteWorkspace = async (e) => {
    e.preventDefault()
    if (confirmName !== workspace.name || deletingWs) return
    setDeletingWs(true)
    try {
      await dispatch(deleteWorkspace(workspaceId)).unwrap()
      toast.success(tPrimary('wsDeleted'))
      navigate('/boards')
    } finally {
      setDeletingWs(false)
    }
  }

  return (
    <PageShell>
      <WorkspaceHeaderNav
        workspace={workspace}
        breadcrumb={breadcrumb}
        myRole={myRole}
        membersCount={membersCount}
        activeTab='settings'
      />

      {!canManage && (
        <Alert severity='info' sx={{ mb: 3 }}>
          {tPrimary('wsReadOnlySettings')}
        </Alert>
      )}

      {/* General Settings */}
      <Box component='form' onSubmit={handleSaveGeneral} noValidate sx={{ ...surfaceSx, mb: 3 }}>
        <Typography variant='h6' sx={{ fontWeight: 800, mb: 2 }}>
          {tPrimary('wsSettingsGeneral')}
        </Typography>

        <Stack spacing={2.25}>
          <TextField
            label={tPrimary('wsFieldName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canManage}
            error={Boolean(nameErrorKey)}
            helperText={nameErrorKey ? tPrimary(nameErrorKey) : tPrimary('wsNameRule')}
            required
            fullWidth
            size='small'
          />

          <TextField
            label={tPrimary('wsFieldDescription')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canManage}
            error={Boolean(descErrorKey)}
            helperText={tPrimary('wsDescriptionRule')}
            multiline
            minRows={2}
            fullWidth
            size='small'
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              label={tPrimary('wsFieldIcon')}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={!canManage}
              inputProps={{ maxLength: 4 }}
              size='small'
              sx={{ width: 120 }}
            />

            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
              {COLOR_PRESETS.map((preset) => (
                <Box
                  key={preset}
                  onClick={() => canManage && setColor(preset)}
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: preset,
                    cursor: canManage ? 'pointer' : 'default',
                    border: color.toLowerCase() === preset.toLowerCase()
                      ? '3px solid #ffffff'
                      : '1px solid rgba(148,163,184,0.4)',
                    boxShadow: color.toLowerCase() === preset.toLowerCase()
                      ? `0 0 0 2px ${preset}`
                      : 'none'
                  }}
                />
              ))}
              <TextField
                label={tPrimary('wsCustomHex')}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={!canManage}
                error={!colorValid}
                helperText={!colorValid ? tPrimary('wsHexRule') : ''}
                size='small'
                sx={{ width: 130 }}
              />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth size='small' disabled={!canManage}>
              <InputLabel id='ws-visibility-label'>{tPrimary('wsFieldVisibility')}</InputLabel>
              <Select
                labelId='ws-visibility-label'
                label={tPrimary('wsFieldVisibility')}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <MenuItem value='private'>{tPrimary('wsVisibilityPrivate')}</MenuItem>
                <MenuItem value='workspace'>{tPrimary('wsVisibilityWorkspace')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size='small' disabled={!canManage}>
              <InputLabel id='ws-default-role-label'>{tPrimary('wsFieldDefaultRole')}</InputLabel>
              <Select
                labelId='ws-default-role-label'
                label={tPrimary('wsFieldDefaultRole')}
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value)}
              >
                {roleOptions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {tPrimary(roleLabelKey(r))}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Box>
            <TextField
              label={tPrimary('wsFieldDomains')}
              value={domainInput}
              onChange={(e) => {
                setDomainInput(e.target.value)
                setDomainError(false)
              }}
              onKeyDown={handleAddDomainKeyDown}
              disabled={!canManage}
              error={domainError}
              helperText={domainError ? tPrimary('wsDomainInvalid') : tPrimary('wsDomainsHelp')}
              fullWidth
              size='small'
            />
            {domains.length > 0 && (
              <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap sx={{ mt: 1 }}>
                {domains.map((d) => (
                  <Chip
                    key={d}
                    size='small'
                    label={d}
                    onDelete={canManage ? () => handleRemoveDomain(d) : undefined}
                  />
                ))}
              </Stack>
            )}
          </Box>

          <Box>
            <PermissionGate permission='workspace:manage' resource={effectiveResource}>
              <Button
                type='submit'
                variant='contained'
                startIcon={<SaveOutlinedIcon />}
                disabled={savingGeneral || Boolean(nameErrorKey) || Boolean(descErrorKey) || !colorValid}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {savingGeneral ? tPrimary('v7Saving') : tPrimary('v7Save')}
              </Button>
            </PermissionGate>
          </Box>
        </Stack>
      </Box>

      {/* Location in the tree */}
      <Box component='form' onSubmit={handleMoveSubmit} sx={{ ...surfaceSx, mb: 3 }}>
        <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
          {tPrimary('wsSettingsLocation')}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
          {formatMessage('wsSettingsLocationBody', { path: pathLabel })}
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
          {tPrimary('wsMoveHelp')}
        </Typography>

        {!hasMoveOptions ? (
          <Typography variant='body2' color='text.secondary'>
            {tPrimary('wsMoveNoTargets')}
          </Typography>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <FormControl size='small' sx={{ minWidth: 260, flex: 1 }} disabled={!canManage}>
              <InputLabel id='ws-move-parent-label'>{tPrimary('wsMoveTarget')}</InputLabel>
              <Select
                labelId='ws-move-parent-label'
                label={tPrimary('wsMoveTarget')}
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
              >
                {allowRootMove && (
                  <MenuItem value='__ROOT__'>{tPrimary('wsMoveToRoot')}</MenuItem>
                )}
                {validMoveTargets.map(({ node, depth }) => (
                  <MenuItem key={node._id} value={node._id} sx={{ pl: 2 + depth * INDENT_STEP }}>
                    {node.icon ? `${node.icon} ` : ''}{node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <PermissionGate permission='workspace:manage' resource={effectiveResource}>
              <Button
                type='submit'
                variant='outlined'
                startIcon={<DriveFileMoveOutlinedIcon />}
                disabled={
                  movingWs || (workspace.parentId || '__ROOT__') === selectedParentId
                }
                sx={{ textTransform: 'none', fontWeight: 700, height: 40 }}
              >
                {tPrimary('wsMove')}
              </Button>
            </PermissionGate>
          </Stack>
        )}
      </Box>

      {/* Danger Zone */}
      <Box
        component='form'
        onSubmit={handleDeleteWorkspace}
        sx={{
          ...surfaceSx,
          borderColor: 'error.main'
        }}
      >
        <Typography variant='h6' color='error' sx={{ fontWeight: 800, mb: 0.5 }}>
          {tPrimary('wsDangerZone')}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {tPrimary('wsDangerBody')}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField
            size='small'
            label={tPrimary('wsDeleteTypeName')}
            placeholder={workspace.name}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            sx={{ flex: 1 }}
          />

          <PermissionGate
            permission='workspace:delete'
            resource={effectiveResource}
            reason={tPrimary('wsOwnerOnly')}
          >
            <Button
              type='submit'
              variant='contained'
              color='error'
              startIcon={<DeleteOutlineRoundedIcon />}
              disabled={deletingWs || confirmName !== workspace.name}
              sx={{ textTransform: 'none', fontWeight: 700, height: 40 }}
            >
              {tPrimary('wsDelete')}
            </Button>
          </PermissionGate>
        </Stack>
      </Box>
    </PageShell>
  )
}

export default WorkspaceSettings
