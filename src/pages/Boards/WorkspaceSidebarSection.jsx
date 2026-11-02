import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import {
  fetchWorkspaceTree,
  selectWorkspaceTree,
  selectCurrentWorkspaceId,
  selectWorkspace
} from '~/redux/workspaces/workspacesSlice'
import { flattenTree, levelLabelKey } from '~/utils/workspaceTree'
import { useTranslation } from '~/customHooks/useTranslation'
import WorkspaceFormDialog from '~/pages/Workspaces/WorkspaceFormDialog'

function WorkspaceSidebarSection() {
  const dispatch = useDispatch()
  const { tPrimary } = useTranslation()

  const tree = useSelector(selectWorkspaceTree)
  const currentWorkspaceId = useSelector(selectCurrentWorkspaceId)

  const [openCreateDialog, setOpenCreateDialog] = useState(false)

  useEffect(() => {
    dispatch(fetchWorkspaceTree())
  }, [dispatch])

  const flatNodes = flattenTree(tree)

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ px: 1, mb: 1 }}>
        <Typography variant='caption' sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
          {tPrimary('wsSidebarTitle')}
        </Typography>
        <Button
          size='small'
          startIcon={<AddRoundedIcon fontSize='small' />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', py: 0.25, px: 0.75 }}
        >
          {tPrimary('wsCreateWorkspace')}
        </Button>
      </Stack>

      <Stack spacing={0.6}>
        {/* All boards option */}
        <Box
          onClick={() => dispatch(selectWorkspace(null))}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            border: '1px solid var(--chella-border, rgba(148, 163, 184, 0.22))',
            bgcolor: (theme) => (!currentWorkspaceId
              ? (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.14)' : '#f0f9ff')
              : (theme.palette.mode === 'dark' ? 'var(--chella-raised-dark, #141824)' : 'var(--chella-raised-light, #ffffff)')),
            borderColor: !currentWorkspaceId
              ? 'var(--fx-accent, #38bdf8)'
              : 'var(--chella-border, rgba(148, 163, 184, 0.22))'
          }}
        >
          <LayersOutlinedIcon fontSize='small' color={!currentWorkspaceId ? 'primary' : 'action'} />
          <Typography variant='body2' sx={{ fontWeight: 700, flex: 1 }} noWrap>
            {tPrimary('wsAllBoards')}
          </Typography>
        </Box>

        {flatNodes.length === 0 ? (
          <Typography variant='caption' color='text.secondary' sx={{ px: 1, py: 0.5 }}>
            {tPrimary('wsEmptyTree')}
          </Typography>
        ) : (
          flatNodes.map(({ node, depth }) => {
            const isSelected = currentWorkspaceId === node._id
            const dotColor = node.color || '#38bdf8'
            return (
              <Box
                key={node._id}
                onClick={() => dispatch(selectWorkspace(node._id))}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 0.75,
                  pl: 1.5 + depth * 1.75,
                  pr: 0.75,
                  py: 0.75,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid var(--chella-border, rgba(148, 163, 184, 0.22))',
                  bgcolor: (theme) => (isSelected
                    ? (theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.14)' : '#f0f9ff')
                    : (theme.palette.mode === 'dark' ? 'var(--chella-raised-dark, #141824)' : 'var(--chella-raised-light, #ffffff)')),
                  borderColor: isSelected
                    ? dotColor
                    : 'var(--chella-border, rgba(148, 163, 184, 0.22))'
                }}
              >
                <Stack direction='row' spacing={1} alignItems='center' sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '6px',
                      bgcolor: dotColor,
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {node.icon || (node.name || 'W').slice(0, 1).toUpperCase()}
                  </Box>
                  <Typography variant='body2' sx={{ fontWeight: isSelected ? 800 : 600, flex: 1 }} noWrap>
                    {node.name}
                  </Typography>
                </Stack>

                <Stack direction='row' spacing={0.5} alignItems='center'>
                  <Chip
                    size='small'
                    label={tPrimary(levelLabelKey(node.level ?? depth))}
                    sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }}
                  />
                  <Tooltip title={tPrimary('wsOpenOverview')} arrow>
                    <IconButton
                      size='small'
                      component={Link}
                      to={`/workspaces/${node._id}`}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ p: 0.35 }}
                    >
                      <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            )
          })
        )}
      </Stack>

      <WorkspaceFormDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreated={(created) => {
          const createdId = created?.workspace?._id || created?._id
          if (createdId) dispatch(selectWorkspace(createdId))
        }}
      />
    </Box>
  )
}

export default WorkspaceSidebarSection
