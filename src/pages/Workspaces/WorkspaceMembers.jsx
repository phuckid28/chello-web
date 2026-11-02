import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined'
import { toast } from 'react-toastify'
import PageShell from '~/components/Layout/PageShell'
import { surfaceSx } from '~/components/Layout/surface'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import {
  fetchWorkspaceDetailsAPI,
  fetchWorkspaceMembersAPI,
  fetchWorkspaceInviteLinksAPI,
  updateWorkspaceMemberRoleAPI,
  removeWorkspaceMemberAPI,
  transferWorkspaceOwnershipAPI
} from '~/apis'
import {
  fetchWorkspaceTree,
  selectWorkspaceTree,
  selectWorkspaceTreeStatus
} from '~/redux/workspaces/workspacesSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  buildBreadcrumb,
  findNode,
  roleLabelKey,
  assignableWorkspaceRoles,
  describeMembership
} from '~/utils/workspaceTree'
import { can } from '~/utils/permissions'
import { useTranslation } from '~/customHooks/useTranslation'
import WorkspaceHeaderNav, { WorkspaceErrorState } from './WorkspaceHeaderNav'
import WorkspaceInviteLinksSection from './WorkspaceInviteLinksSection'

const normalizeMemberEntry = (entry) => {
  const userObj = entry?.user || entry || {}
  const userId = userObj._id || entry?.userId || entry?._id || ''
  return {
    raw: entry,
    userId,
    displayName: userObj.displayName || userObj.username || userObj.email || 'User',
    username: userObj.username || '',
    email: userObj.email || '',
    avatar: userObj.avatar || '',
    status: userObj.status || entry?.status || 'active',
    role: entry?.role || 'member',
    inherited: Boolean(entry?.inherited),
    sourceWorkspaceId: entry?.sourceWorkspaceId || null,
    joinedAt: entry?.joinedAt || entry?.createdAt || null
  }
}

function WorkspaceMembers() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { tPrimary, formatMessage } = useTranslation()

  const currentUser = useSelector(selectCurrentUser)
  const tree = useSelector(selectWorkspaceTree)
  const treeStatus = useSelector(selectWorkspaceTreeStatus)

  const [details, setDetails] = useState(null)
  const [members, setMembers] = useState([])
  const [inviteLinks, setInviteLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState(null)

  const [removingTarget, setRemovingTarget] = useState(null)
  const [removingSubmitting, setRemovingSubmitting] = useState(false)

  const [transferOpen, setTransferOpen] = useState(false)
  const [transferUserId, setTransferUserId] = useState('')
  const [transferSubmitting, setTransferSubmitting] = useState(false)

  const loadInviteLinks = useCallback(async (wsResource) => {
    if (!workspaceId) return
    if (!can(wsResource, 'workspace:manage', currentUser)) {
      setInviteLinks([])
      return
    }
    try {
      const res = await fetchWorkspaceInviteLinksAPI(workspaceId)
      const list = Array.isArray(res) ? res : (res?.inviteLinks || res?.links || [])
      setInviteLinks(list)
    } catch (err) {
      setInviteLinks([])
    }
  }, [workspaceId, currentUser])

  const loadPageData = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setErrorStatus(null)
    try {
      const [wsData, membersData] = await Promise.all([
        fetchWorkspaceDetailsAPI(workspaceId),
        fetchWorkspaceMembersAPI(workspaceId)
      ])
      setDetails(wsData)
      const rawMembers = Array.isArray(membersData) ? membersData : (membersData?.members || [])
      setMembers(rawMembers.map(normalizeMemberEntry))

      const ws = wsData?.workspace || wsData
      const role = wsData?.myRole || ws?.myRole || 'member'
      await loadInviteLinks({ ...ws, myRole: role, permissions: wsData?.permissions || ws?.permissions })
    } catch (err) {
      setErrorStatus(err?.response?.status || 404)
    } finally {
      setLoading(false)
    }
  }, [workspaceId, loadInviteLinks])

  useEffect(() => {
    if (treeStatus === 'idle') {
      dispatch(fetchWorkspaceTree())
    }
  }, [treeStatus, dispatch])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

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
  const membersCount = members.length || details?.membersCount || workspace?.membersCount || 0

  const effectiveResource = {
    ...workspace,
    myRole,
    permissions: details?.permissions || workspace?.permissions
  }

  const canManageMembers = can(effectiveResource, 'member:manage', currentUser)
  const canManageWorkspace = can(effectiveResource, 'workspace:manage', currentUser)
  const canTransfer = can(effectiveResource, 'workspace:transfer', currentUser)
  const assignableRoles = assignableWorkspaceRoles(myRole, currentUser?.role === 'admin')

  const explicitTransferCandidates = members.filter(
    (m) => !m.inherited && m.userId && m.userId !== currentUser?._id
  )

  const handleRoleChange = async (member, nextRole) => {
    if (!member.userId || nextRole === member.role) return
    await updateWorkspaceMemberRoleAPI(workspaceId, member.userId, nextRole)
    toast.success(tPrimary('wsRoleUpdated'))
    loadPageData()
  }

  const handleConfirmRemove = async () => {
    if (!removingTarget?.userId || removingSubmitting) return
    setRemovingSubmitting(true)
    try {
      const isSelf = removingTarget.userId === currentUser?._id
      await removeWorkspaceMemberAPI(workspaceId, removingTarget.userId)
      toast.success(tPrimary('wsMemberRemoved'))
      setRemovingTarget(null)
      if (isSelf) {
        dispatch(fetchWorkspaceTree())
        navigate('/boards')
      } else {
        loadPageData()
      }
    } finally {
      setRemovingSubmitting(false)
    }
  }

  const handleTransferSubmit = async (e) => {
    e.preventDefault()
    if (!transferUserId || transferSubmitting) return
    setTransferSubmitting(true)
    try {
      await transferWorkspaceOwnershipAPI(workspaceId, transferUserId)
      toast.success(tPrimary('wsTransferred'))
      setTransferOpen(false)
      setTransferUserId('')
      dispatch(fetchWorkspaceTree())
      loadPageData()
    } finally {
      setTransferSubmitting(false)
    }
  }

  return (
    <PageShell>
      <WorkspaceHeaderNav
        workspace={workspace}
        breadcrumb={breadcrumb}
        myRole={myRole}
        membersCount={membersCount}
        activeTab='members'
        actions={
          canTransfer && explicitTransferCandidates.length > 0 ? (
            <Button
              variant='outlined'
              size='small'
              startIcon={<SwapHorizRoundedIcon />}
              onClick={() => {
                setTransferUserId(explicitTransferCandidates[0]?.userId || '')
                setTransferOpen(true)
              }}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {tPrimary('wsTransferOwnership')}
            </Button>
          ) : null
        }
      />

      {/* Members Table */}
      <Box sx={{ ...surfaceSx, mb: 3 }}>
        <Typography variant='h6' sx={{ fontWeight: 800, mb: 2 }}>
          {tPrimary('wsMembers')} ({members.length})
        </Typography>

        {members.length === 0 ? (
          <Typography variant='body2' color='text.secondary'>
            {tPrimary('wsNoMembers')}
          </Typography>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>{tPrimary('wsMemberColUser')}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{tPrimary('wsMemberColRole')}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{tPrimary('wsMemberColSource')}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{tPrimary('wsMemberColJoined')}</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 800 }}>{tPrimary('wsMemberColActions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => {
                  const isYou = Boolean(currentUser?._id && member.userId === currentUser._id)
                  const membershipInfo = describeMembership(member.raw, { breadcrumb, tree })
                  const sourceLabel = membershipInfo.kind === 'explicit'
                    ? tPrimary('wsExplicit')
                    : (membershipInfo.sourceName
                      ? formatMessage('wsInheritedFrom', { name: membershipInfo.sourceName })
                      : tPrimary('wsInheritedUnknown'))

                  const canEditThisRole = canManageMembers
                    && (member.role !== 'owner' || myRole === 'owner' || currentUser?.role === 'admin')
                  const roleChoices = assignableRoles.includes(member.role)
                    ? assignableRoles
                    : [member.role, ...assignableRoles]

                  return (
                    <TableRow key={`${member.userId}-${member.inherited ? 'inh' : 'exp'}`} hover>
                      <TableCell>
                        <Stack direction='row' spacing={1.25} alignItems='center'>
                          <Avatar src={member.avatar} alt={member.displayName} sx={{ width: 34, height: 34 }}>
                            {(member.displayName || 'U').slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Stack direction='row' spacing={0.75} alignItems='center'>
                              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                                {member.displayName}
                              </Typography>
                              {isYou && (
                                <Chip size='small' color='info' label={tPrimary('wsYou')} sx={{ height: 20, fontSize: '0.68rem' }} />
                              )}
                              {member.status === 'suspended' && (
                                <Chip size='small' color='warning' label={tPrimary('wsSuspended')} sx={{ height: 20, fontSize: '0.68rem' }} />
                              )}
                            </Stack>
                            {member.username ? (
                              <Typography
                                variant='caption'
                                component={Link}
                                to={`/u/${member.username}`}
                                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                              >
                                @{member.username}
                              </Typography>
                            ) : (
                              <Typography variant='caption' color='text.secondary'>
                                {member.email}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        {canEditThisRole ? (
                          <Tooltip title={member.inherited ? tPrimary('wsInheritedHint') : ''} arrow>
                            <Select
                              size='small'
                              value={member.role}
                              onChange={(e) => handleRoleChange(member, e.target.value)}
                              sx={{ minWidth: 130, fontSize: '0.84rem' }}
                            >
                              {roleChoices.map((r) => (
                                <MenuItem key={r} value={r}>
                                  {tPrimary(roleLabelKey(r))}
                                </MenuItem>
                              ))}
                            </Select>
                          </Tooltip>
                        ) : (
                          <Chip
                            size='small'
                            label={tPrimary(roleLabelKey(member.role))}
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size='small'
                          variant={membershipInfo.kind === 'explicit' ? 'filled' : 'outlined'}
                          color={membershipInfo.kind === 'explicit' ? 'success' : 'default'}
                          label={sourceLabel}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant='caption' color='text.secondary'>
                          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align='right'>
                        {(canManageMembers || isYou) && (
                          member.inherited ? (
                            <Tooltip title={tPrimary('wsCannotRemoveInherited')} arrow>
                              <Box component='span' sx={{ display: 'inline-flex' }}>
                                <Button
                                  size='small'
                                  color='error'
                                  disabled
                                  startIcon={<PersonRemoveOutlinedIcon fontSize='small' />}
                                  sx={{ textTransform: 'none' }}
                                >
                                  {isYou ? tPrimary('wsLeave') : tPrimary('v7Remove')}
                                </Button>
                              </Box>
                            </Tooltip>
                          ) : (
                            <Button
                              size='small'
                              color='error'
                              disabled={member.role === 'owner' && !isYou && currentUser?.role !== 'admin'}
                              startIcon={<PersonRemoveOutlinedIcon fontSize='small' />}
                              onClick={() => setRemovingTarget(member)}
                              sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                              {isYou ? tPrimary('wsLeave') : tPrimary('v7Remove')}
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Email Invite & Invite Links */}
      <WorkspaceInviteLinksSection
        workspaceId={workspaceId}
        canManageMembers={canManageMembers}
        canManageWorkspace={canManageWorkspace}
        inviteLinks={inviteLinks}
        onLinksChange={() => loadInviteLinks(effectiveResource)}
      />

      {/* Remove / Leave Member Confirmation Dialog */}
      <Dialog open={Boolean(removingTarget)} onClose={() => setRemovingTarget(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {formatMessage('wsRemoveMemberTitle', { name: removingTarget?.displayName || '' })}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant='body2' color='text.secondary'>
            {tPrimary('wsRemoveMemberBody')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setRemovingTarget(null)} disabled={removingSubmitting}>
            {tPrimary('v7Cancel')}
          </Button>
          <Button
            color='error'
            variant='contained'
            onClick={handleConfirmRemove}
            disabled={removingSubmitting}
          >
            {tPrimary('v7Confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Ownership Dialog */}
      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth='xs' fullWidth>
        <Box component='form' onSubmit={handleTransferSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>{tPrimary('wsTransferOwnership')}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant='body2' color='text.secondary'>
                {tPrimary('wsTransferBody')}
              </Typography>
              <FormControl fullWidth size='small'>
                <InputLabel id='transfer-owner-select-label'>{tPrimary('wsTransferPick')}</InputLabel>
                <Select
                  labelId='transfer-owner-select-label'
                  label={tPrimary('wsTransferPick')}
                  value={transferUserId}
                  onChange={(e) => setTransferUserId(e.target.value)}
                >
                  {explicitTransferCandidates.map((m) => (
                    <MenuItem key={m.userId} value={m.userId}>
                      {m.displayName} {m.username ? `(@${m.username})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setTransferOpen(false)} disabled={transferSubmitting}>
              {tPrimary('v7Cancel')}
            </Button>
            <Button type='submit' variant='contained' color='warning' disabled={transferSubmitting || !transferUserId}>
              {tPrimary('v7Confirm')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </PageShell>
  )
}

export default WorkspaceMembers
