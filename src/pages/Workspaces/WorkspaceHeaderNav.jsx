import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import PageShell from '~/components/Layout/PageShell'
import { surfaceSx } from '~/components/Layout/surface'
import { levelLabelKey, roleLabelKey } from '~/utils/workspaceTree'
import { useTranslation } from '~/customHooks/useTranslation'

export function WorkspaceErrorState({ status }) {
  const { tPrimary } = useTranslation()
  const isForbidden = status === 403
  const title = tPrimary(isForbidden ? 'wsForbiddenTitle' : 'wsNotFoundTitle')
  const body = tPrimary(isForbidden ? 'wsForbiddenBody' : 'wsNotFoundBody')

  return (
    <PageShell eyebrow={tPrimary('wsSidebarTitle')} title={title} subtitle={body}>
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

function WorkspaceHeaderNav({
  workspace,
  breadcrumb = [],
  myRole = 'member',
  membersCount = 0,
  activeTab = 'overview',
  actions = null
}) {
  const { tPrimary, formatMessage } = useTranslation()

  if (!workspace) return null

  const accentColor = workspace.color || '#38bdf8'
  const levelKey = levelLabelKey(workspace.level)
  const roleKey = roleLabelKey(myRole)
  const wsId = workspace._id

  const tabs = [
    {
      key: 'overview',
      label: tPrimary('wsOverview'),
      to: `/workspaces/${wsId}`,
      icon: <DashboardOutlinedIcon fontSize='small' />
    },
    {
      key: 'members',
      label: tPrimary('wsMembers'),
      to: `/workspaces/${wsId}/members`,
      icon: <GroupOutlinedIcon fontSize='small' />
    },
    {
      key: 'settings',
      label: tPrimary('wsSettings'),
      to: `/workspaces/${wsId}/settings`,
      icon: <SettingsOutlinedIcon fontSize='small' />
    }
  ]

  return (
    <Box
      sx={{
        ...surfaceSx,
        mb: 3,
        borderTop: `4px solid ${accentColor}`
      }}
    >
      <Stack spacing={2}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={1}>
          <Breadcrumbs
            separator={<NavigateNextRoundedIcon fontSize='small' />}
            aria-label={tPrimary('wsBreadcrumbLabel')}
          >
            <Button
              component={Link}
              to='/boards'
              size='small'
              sx={{ textTransform: 'none', fontWeight: 600, minWidth: 0, px: 0.75 }}
            >
              {tPrimary('wsAllBoards')}
            </Button>
            {breadcrumb.map((item, idx) => {
              const isLast = idx === breadcrumb.length - 1
              return isLast ? (
                <Typography key={item._id} variant='body2' sx={{ fontWeight: 800 }}>
                  {item.name}
                </Typography>
              ) : (
                <Button
                  key={item._id}
                  component={Link}
                  to={`/workspaces/${item._id}`}
                  size='small'
                  sx={{ textTransform: 'none', fontWeight: 600, minWidth: 0, px: 0.75 }}
                >
                  {item.name}
                </Button>
              )
            })}
          </Breadcrumbs>

          {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
        </Stack>

        <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={2}>
          <Stack direction='row' spacing={1.75} alignItems='center'>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: accentColor,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                flexShrink: 0
              }}
            >
              {workspace.icon || (workspace.name || 'W').slice(0, 1).toUpperCase()}
            </Box>

            <Box>
              <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                <Typography variant='h5' sx={{ fontWeight: 800 }}>
                  {workspace.name}
                </Typography>
                <Chip
                  size='small'
                  label={tPrimary(levelKey)}
                  sx={{ fontWeight: 700, borderColor: accentColor }}
                  variant='outlined'
                />
                {roleKey && (
                  <Chip
                    size='small'
                    color='primary'
                    label={`${tPrimary('wsYourRole')}: ${tPrimary(roleKey)}`}
                    sx={{ fontWeight: 700 }}
                  />
                )}
                <Chip
                  size='small'
                  variant='outlined'
                  label={formatMessage('wsMembersCount', { count: membersCount })}
                />
              </Stack>
              {workspace.description && (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                  {workspace.description}
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>

        <Stack direction='row' spacing={1} sx={{ pt: 1, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <Button
                key={tab.key}
                component={Link}
                to={tab.to}
                variant={isActive ? 'contained' : 'text'}
                size='small'
                startIcon={tab.icon}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '8px'
                }}
              >
                {tab.label}
              </Button>
            )
          })}
        </Stack>
      </Stack>
    </Box>
  )
}

export default WorkspaceHeaderNav
