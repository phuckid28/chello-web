import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { toast } from 'react-toastify'
import PageShell from '~/components/Layout/PageShell'
import { surfaceSx } from '~/components/Layout/surface'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import PermissionGate from '~/components/Permission/PermissionGate'
import {
  fetchWorkspaceDetailsAPI,
  attachBoardToWorkspaceAPI,
  createNewBoardAPI
} from '~/apis'
import {
  fetchWorkspaceTree,
  selectWorkspaceTree,
  selectWorkspaceTreeStatus
} from '~/redux/workspaces/workspacesSlice'
import {
  buildBreadcrumb,
  findNode,
  levelLabelKey,
  canHaveChildren,
  buildSelectOptions
} from '~/utils/workspaceTree'
import { useTranslation } from '~/customHooks/useTranslation'
import WorkspaceHeaderNav, { WorkspaceErrorState } from './WorkspaceHeaderNav'
import WorkspaceFormDialog from './WorkspaceFormDialog'

function WorkspaceOverview() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { tPrimary, formatMessage } = useTranslation()

  const tree = useSelector(selectWorkspaceTree)
  const treeStatus = useSelector(selectWorkspaceTreeStatus)

  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState(null)

  const [openChildModal, setOpenChildModal] = useState(false)
  const [openCreateBoard, setOpenCreateBoard] = useState(false)
  const [boardTitle, setBoardTitle] = useState('')
  const [boardDesc, setBoardDesc] = useState('')
  const [creatingBoard, setCreatingBoard] = useState(false)

  const [movingBoard, setMovingBoard] = useState(null)
  const [targetWsId, setTargetWsId] = useState('')
  const [movingSubmitting, setMovingSubmitting] = useState(false)

  const loadDetails = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setErrorStatus(null)
    try {
      const data = await fetchWorkspaceDetailsAPI(workspaceId)
      setDetails(data)
    } catch (err) {
      const status = err?.response?.status || 404
      setErrorStatus(status)
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    if (treeStatus === 'idle') {
      dispatch(fetchWorkspaceTree())
    }
  }, [treeStatus, dispatch])

  useEffect(() => {
    loadDetails()
  }, [loadDetails])

  if (loading) {
    return <PageLoadingSpinner caption={tPrimary('v7Loading')} />
  }

  if (errorStatus || !details) {
    return <WorkspaceErrorState status={errorStatus || 404} />
  }

  const workspace = details?.workspace || details
  const children = details?.children || workspace?.children || []
  const boards = details?.boards || workspace?.boards || []
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

  const allowChildren = canHaveChildren(workspace)
  const selectOptions = buildSelectOptions(tree)

  const handleOpenCreateBoard = () => {
    setBoardTitle(`Sprint • ${workspace.name}`)
    setBoardDesc('')
    setOpenCreateBoard(true)
  }

  const handleCreateBoardSubmit = async (e) => {
    e.preventDefault()
    if (!boardTitle.trim() || creatingBoard) return
    setCreatingBoard(true)
    try {
      const created = await createNewBoardAPI({
        title: boardTitle.trim(),
        description: boardDesc.trim() || workspace.name,
        type: 'public',
        workspaceId: workspace._id,
        useTemplate: true
      })
      setOpenCreateBoard(false)
      if (created?._id) {
        navigate(`/boards/${created._id}`)
      } else {
        loadDetails()
      }
    } finally {
      setCreatingBoard(false)
    }
  }

  const handleOpenMoveBoard = (board) => {
    setMovingBoard(board)
    setTargetWsId(board.workspaceId || workspace._id || '')
  }

  const handleMoveBoardSubmit = async (e) => {
    e.preventDefault()
    if (!movingBoard || movingSubmitting) return
    setMovingSubmitting(true)
    try {
      await attachBoardToWorkspaceAPI(movingBoard._id, targetWsId || null)
      toast.success(tPrimary('wsBoardMoved'))
      setMovingBoard(null)
      loadDetails()
    } finally {
      setMovingSubmitting(false)
    }
  }

  return (
    <PageShell>
      <WorkspaceHeaderNav
        workspace={workspace}
        breadcrumb={breadcrumb}
        myRole={myRole}
        membersCount={membersCount}
        activeTab='overview'
      />

      {/* Sub-workspaces section */}
      <Box sx={{ ...surfaceSx, mb: 3 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={1.5} sx={{ mb: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 800 }}>
            {tPrimary('wsChildrenTitle')} ({children.length})
          </Typography>

          <PermissionGate permission='workspace:manage' resource={effectiveResource}>
            {allowChildren ? (
              <Button
                variant='outlined'
                size='small'
                startIcon={<AddRoundedIcon />}
                onClick={() => setOpenChildModal(true)}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {tPrimary('wsCreateChild')}
              </Button>
            ) : (
              <Tooltip title={tPrimary('wsMaxDepthReached')} arrow>
                <Box component='span' sx={{ display: 'inline-flex' }}>
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<AddRoundedIcon />}
                    disabled
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {tPrimary('wsCreateChild')}
                  </Button>
                </Box>
              </Tooltip>
            )}
          </PermissionGate>
        </Stack>

        {children.length === 0 ? (
          <Typography variant='body2' color='text.secondary'>
            {tPrimary('wsNoChildren')}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {children.map((child) => {
              const childColor = child.color || '#38bdf8'
              return (
                <Grid xs={12} sm={6} md={4} key={child._id}>
                  <Box
                    component={Link}
                    to={`/workspaces/${child._id}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      p: 2,
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'text.primary',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderLeft: `4px solid ${childColor}`,
                      transition: 'transform 0.18s ease, border-color 0.18s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: childColor
                      }
                    }}
                  >
                    <Stack direction='row' spacing={1.25} alignItems='center' sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          bgcolor: childColor,
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          flexShrink: 0
                        }}
                      >
                        {child.icon || (child.name || 'S').slice(0, 1).toUpperCase()}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 800 }} noWrap>
                          {child.name}
                        </Typography>
                        <Chip
                          size='small'
                          label={tPrimary(levelLabelKey(child.level ?? (workspace.level || 0) + 1))}
                          sx={{ height: 20, fontSize: '0.68rem', mt: 0.25 }}
                        />
                      </Box>
                    </Stack>
                    <ArrowForwardRoundedIcon fontSize='small' color='action' />
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>

      {/* Boards in this workspace section */}
      <Box sx={surfaceSx}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={1.5} sx={{ mb: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 800 }}>
            {tPrimary('wsBoardsTitle')} ({boards.length})
          </Typography>

          <PermissionGate permission='board:create' resource={effectiveResource}>
            <Button
              variant='contained'
              size='small'
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenCreateBoard}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {tPrimary('wsCreateBoard')}
            </Button>
          </PermissionGate>
        </Stack>

        {boards.length === 0 ? (
          <Typography variant='body2' color='text.secondary'>
            {tPrimary('wsNoBoards')}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {boards.map((board) => (
              <Grid xs={12} sm={6} md={4} key={board._id}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    gap: 1.5
                  }}
                >
                  <Box>
                    <Typography
                      variant='subtitle1'
                      component={Link}
                      to={`/boards/${board._id}`}
                      sx={{
                        fontWeight: 800,
                        textDecoration: 'none',
                        color: 'text.primary',
                        display: 'block',
                        '&:hover': { color: 'primary.main' }
                      }}
                      noWrap
                    >
                      {board.title}
                    </Typography>
                    {board.description && (
                      <Typography variant='body2' color='text.secondary' noWrap sx={{ mt: 0.5 }}>
                        {board.description}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
                    <Button
                      size='small'
                      startIcon={<DriveFileMoveOutlinedIcon fontSize='small' />}
                      onClick={() => handleOpenMoveBoard(board)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {tPrimary('wsMoveBoard')}
                    </Button>
                    <Button
                      component={Link}
                      to={`/boards/${board._id}`}
                      size='small'
                      endIcon={<ArrowForwardRoundedIcon fontSize='small' />}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      {tPrimary('wsInviteScopeBoard')}
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create Sub-workspace Modal */}
      <WorkspaceFormDialog
        open={openChildModal}
        onClose={() => setOpenChildModal(false)}
        parentWorkspace={workspace}
        onCreated={() => loadDetails()}
      />

      {/* Create Board in Workspace Dialog */}
      <Dialog open={openCreateBoard} onClose={() => setOpenCreateBoard(false)} maxWidth='xs' fullWidth>
        <Box component='form' onSubmit={handleCreateBoardSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>{tPrimary('wsCreateBoard')}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant='caption' color='text.secondary'>
                {formatMessage('wsCreateBoardIn', { name: workspace.name })}
              </Typography>
              <TextField
                label={tPrimary('wsFieldName')}
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                required
                fullWidth
                size='small'
                autoFocus
              />
              <TextField
                label={tPrimary('wsFieldDescription')}
                value={boardDesc}
                onChange={(e) => setBoardDesc(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                size='small'
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setOpenCreateBoard(false)} disabled={creatingBoard}>
              {tPrimary('v7Cancel')}
            </Button>
            <Button type='submit' variant='contained' disabled={creatingBoard || !boardTitle.trim()}>
              {creatingBoard ? tPrimary('v7Saving') : tPrimary('v7Create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Move Board to another Workspace Dialog */}
      <Dialog open={Boolean(movingBoard)} onClose={() => setMovingBoard(null)} maxWidth='xs' fullWidth>
        <Box component='form' onSubmit={handleMoveBoardSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {formatMessage('wsMoveBoardTitle', { name: movingBoard?.title || '' })}
          </DialogTitle>
          <DialogContent dividers>
            <FormControl fullWidth size='small'>
              <InputLabel id='move-board-ws-label'>{tPrimary('wsSidebarTitle')}</InputLabel>
              <Select
                labelId='move-board-ws-label'
                label={tPrimary('wsSidebarTitle')}
                value={targetWsId}
                onChange={(e) => setTargetWsId(e.target.value)}
              >
                <MenuItem value=''>
                  <em>{tPrimary('wsMoveBoardNone')}</em>
                </MenuItem>
                {selectOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ pl: 2 + opt.indent }}>
                    {opt.icon ? `${opt.icon} ` : ''}{opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setMovingBoard(null)} disabled={movingSubmitting}>
              {tPrimary('v7Cancel')}
            </Button>
            <Button type='submit' variant='contained' disabled={movingSubmitting}>
              {movingSubmitting ? tPrimary('v7Saving') : tPrimary('v7Save')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </PageShell>
  )
}

export default WorkspaceOverview
