import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded'
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'

const containmentPanelSx = {
  ...surfaceSx,
  mb: 3,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 320px auto 380px',
  '@supports not (content-visibility: auto)': {
    contain: 'layout style paint'
  }
}

const stickyTableWrapperSx = {
  overflow: 'auto',
  maxInlineSize: '100%',
  maxBlockSize: 'min(540px, 74vh)',
  containerType: 'inline-size'
}

const stickyHeadCellSx = {
  fontWeight: 800,
  position: 'sticky',
  insetBlockStart: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
  whiteSpace: 'nowrap'
}

function PermissionMatrixTab({
  rbacData,
  users,
  simulationResult,
  onSaveMatrix,
  onSimulatePermissions,
  busy
}) {
  const [draftMatrix, setDraftMatrix] = useState({})
  const [tierFilter, setTierFilter] = useState('all')
  const [simUserId, setSimUserId] = useState('')
  const [simGlobalRole, setSimGlobalRole] = useState('client')
  const [simWorkspaceRole, setSimWorkspaceRole] = useState('member')
  const [simBoardRole, setSimBoardRole] = useState('editor')

  useEffect(() => {
    if (rbacData?.matrix) {
      setDraftMatrix(rbacData.matrix)
    }
  }, [rbacData])

  const scopes = rbacData?.scopes || []
  const globalRoles = rbacData?.globalRoles || []
  const workspaceRoles = rbacData?.workspaceRoles || []
  const boardRoles = rbacData?.boardRoles || []

  const filteredScopes = scopes.filter((s) => tierFilter === 'all' || s.tier === tierFilter)

  const handleToggleScope = (tierKey, roleId, scopeKey) => {
    if (tierKey === 'global' && roleId === 'admin' && (scopeKey === 'admin.rbac.manage' || scopeKey === 'admin.users.manage')) {
      return // Prevent locking out global admin
    }
    setDraftMatrix((prev) => {
      const tierObj = prev?.[tierKey] || {}
      const roleObj = tierObj?.[roleId] || {}
      return {
        ...prev,
        [tierKey]: {
          ...tierObj,
          [roleId]: {
            ...roleObj,
            [scopeKey]: !roleObj[scopeKey]
          }
        }
      }
    })
  }

  const handleResetDefault = () => {
    if (rbacData?.defaultMatrix) {
      setDraftMatrix(rbacData.defaultMatrix)
    }
  }

  const handleRunSimulation = () => {
    onSimulatePermissions({
      userId: simUserId || undefined,
      globalRole: simGlobalRole,
      workspaceRole: simWorkspaceRole,
      boardRole: simBoardRole
    })
  }

  return (
    <Box>
      {/* 1. 3-Tier RBAC Matrix Editor */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>
              Ma trận Phân quyền Đa tầng (3-Tier RBAC Matrix: Global × Workspace × Board)
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Quản trị tập trung 30 quyền nguyên tử (Atomic Scopes) trên 3 cấp độ: Hệ thống, Không gian làm việc và Bảng dự án.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <FormControl size='small' sx={{ minWidth: 160 }}>
              <InputLabel>Lọc theo cấp độ</InputLabel>
              <Select label='Lọc theo cấp độ' value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                <MenuItem value='all'>Tất cả 3 cấp (30 quyền)</MenuItem>
                <MenuItem value='global'>Cấp Hệ thống (Global)</MenuItem>
                <MenuItem value='workspace'>Cấp Workspace</MenuItem>
                <MenuItem value='board'>Cấp Board & Card</MenuItem>
              </Select>
            </FormControl>
            <Button
              size='small'
              variant='outlined'
              startIcon={<RestoreRoundedIcon />}
              disabled={busy}
              onClick={handleResetDefault}
              sx={{ fontWeight: 700 }}
            >
              Khôi phục mặc định
            </Button>
            <Button
              size='small'
              variant='contained'
              startIcon={<SaveRoundedIcon />}
              disabled={busy}
              onClick={() => onSaveMatrix(draftMatrix)}
              sx={{ fontWeight: 800 }}
            >
              Lưu Ma trận RBAC
            </Button>
          </Box>
        </Box>

        <TableContainer tabIndex={0} role='region' aria-label='RBAC Permission Matrix' sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ minWidth: 1120 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...stickyHeadCellSx, minWidth: 230 }}>Quyền nguyên tử (Scope)</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 95 }}>Tầng</TableCell>
                {globalRoles.map((r) => (
                  <TableCell key={`g-${r.id}`} align='center' sx={{ ...stickyHeadCellSx, fontSize: '0.72rem' }}>
                    G: {r.label}
                  </TableCell>
                ))}
                {workspaceRoles.map((r) => (
                  <TableCell key={`w-${r.id}`} align='center' sx={{ ...stickyHeadCellSx, fontSize: '0.72rem' }}>
                    W: {r.label}
                  </TableCell>
                ))}
                {boardRoles.map((r) => (
                  <TableCell key={`b-${r.id}`} align='center' sx={{ ...stickyHeadCellSx, fontSize: '0.72rem' }}>
                    B: {r.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredScopes.map((sc) => (
                <TableRow key={sc.key} hover>
                  <TableCell component='th' scope='row'>
                    <Typography variant='body2' sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{sc.label}</Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>{sc.key}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      color={sc.tier === 'global' ? 'error' : sc.tier === 'workspace' ? 'primary' : 'success'}
                      label={sc.tier.toUpperCase()}
                      sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20, fontSize: '0.68rem' }}
                    />
                  </TableCell>
                  {globalRoles.map((r) => {
                    const checked = Boolean(draftMatrix?.global?.[r.id]?.[sc.key])
                    const lockedAdmin = r.id === 'admin' && (sc.key === 'admin.rbac.manage' || sc.key === 'admin.users.manage')
                    return (
                      <TableCell key={`g-${r.id}-${sc.key}`} align='center' padding='none'>
                        <Checkbox
                          size='small'
                          color='error'
                          checked={checked}
                          disabled={busy || lockedAdmin}
                          onChange={() => handleToggleScope('global', r.id, sc.key)}
                          inputProps={{ 'aria-label': `${r.label} - ${sc.label}` }}
                        />
                      </TableCell>
                    )
                  })}
                  {workspaceRoles.map((r) => {
                    const checked = Boolean(draftMatrix?.workspace?.[r.id]?.[sc.key])
                    return (
                      <TableCell key={`w-${r.id}-${sc.key}`} align='center' padding='none'>
                        <Checkbox
                          size='small'
                          color='primary'
                          checked={checked}
                          disabled={busy || sc.tier === 'global'}
                          onChange={() => handleToggleScope('workspace', r.id, sc.key)}
                          inputProps={{ 'aria-label': `Workspace ${r.label} - ${sc.label}` }}
                        />
                      </TableCell>
                    )
                  })}
                  {boardRoles.map((r) => {
                    const checked = Boolean(draftMatrix?.board?.[r.id]?.[sc.key])
                    return (
                      <TableCell key={`b-${r.id}-${sc.key}`} align='center' padding='none'>
                        <Checkbox
                          size='small'
                          color='success'
                          checked={checked}
                          disabled={busy || sc.tier !== 'board'}
                          onChange={() => handleToggleScope('board', r.id, sc.key)}
                          inputProps={{ 'aria-label': `Board ${r.label} - ${sc.label}` }}
                        />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 2. Effective Permission Simulator & Shadow User Inspector */}
      <Box sx={{ ...containmentPanelSx, mb: 0 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>
            Trình Mô phỏng Quyền Thực tế (Effective Permission Simulator & Shadow User View)
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Kiểm tra chính xác một tài khoản hoặc tổ hợp vai trò (Global + Workspace + Board) được phép thực hiện những thao tác nào.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr 1.2fr 1.2fr 1.2fr auto' }, gap: 1.5, mb: 2, alignItems: 'center' }}>
          <FormControl size='small'>
            <InputLabel>Chọn người dùng thực tế (Tùy chọn)</InputLabel>
            <Select
              label='Chọn người dùng thực tế (Tùy chọn)'
              value={simUserId}
              onChange={(e) => {
                const uid = e.target.value
                setSimUserId(uid)
                const found = (users || []).find(u => u._id === uid)
                if (found?.role) setSimGlobalRole(found.role)
              }}
            >
              <MenuItem value=''>— Mô phỏng theo Vai trò tùy chọn —</MenuItem>
              {(users || []).map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.displayName || u.username || u.email} ({u.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small'>
            <InputLabel>Global Role</InputLabel>
            <Select label='Global Role' value={simGlobalRole} onChange={(e) => setSimGlobalRole(e.target.value)}>
              {globalRoles.map(r => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size='small'>
            <InputLabel>Workspace Role</InputLabel>
            <Select label='Workspace Role' value={simWorkspaceRole} onChange={(e) => setSimWorkspaceRole(e.target.value)}>
              {workspaceRoles.map(r => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size='small'>
            <InputLabel>Board Role</InputLabel>
            <Select label='Board Role' value={simBoardRole} onChange={(e) => setSimBoardRole(e.target.value)}>
              {boardRoles.map(r => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>

          <Button
            variant='contained'
            startIcon={<VerifiedUserRoundedIcon />}
            disabled={busy}
            onClick={handleRunSimulation}
            sx={{ fontWeight: 800, height: 40, whiteSpace: 'nowrap' }}
          >
            Mô phỏng Quyền
          </Button>
        </Box>

        {simulationResult?.evaluation && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <EditorialLabel index={1}>KẾT QUẢ MÔ PHỎNG</EditorialLabel>
              <Chip
                color='success'
                size='small'
                label={`ĐƯỢC CẤP: ${simulationResult.evaluation.grantedCount} / ${simulationResult.evaluation.totalScopes} QUYỀN`}
                sx={{ fontFamily: MONO_FONT, fontWeight: 800 }}
              />
              {simulationResult.targetUser && (
                <Chip
                  size='small'
                  variant='outlined'
                  label={`User: ${simulationResult.targetUser.email} (${simulationResult.targetUser.role})`}
                  sx={{ fontFamily: MONO_FONT }}
                />
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
              {(simulationResult.evaluation.scopes || []).map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: item.allowed ? 'success.main' : 'divider',
                    bgcolor: 'background.default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant='body2' noWrap sx={{ fontWeight: 700, fontSize: '0.78rem' }}>{item.label}</Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT, display: 'block', fontSize: '0.68rem' }}>
                      {item.allowed ? `Nguồn: ${item.grantedBy.join(', ')}` : 'Bị từ chối (Denied)'}
                    </Typography>
                  </Box>
                  <Chip
                    size='small'
                    color={item.allowed ? 'success' : 'default'}
                    label={item.allowed ? 'ALLOW' : 'DENY'}
                    sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20, fontSize: '0.68rem' }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default PermissionMatrixTab
