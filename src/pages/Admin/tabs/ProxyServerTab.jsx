import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import NetworkCheckRoundedIcon from '@mui/icons-material/NetworkCheckRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'

const containmentPanelSx = {
  ...surfaceSx,
  mb: 3,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 300px auto 360px',
  '@supports not (content-visibility: auto)': {
    contain: 'layout style paint'
  }
}

const stickyTableWrapperSx = {
  overflow: 'auto',
  maxInlineSize: '100%',
  maxBlockSize: 'min(420px, 68vh)',
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

function ProxyServerTab({
  networkData,
  onUpdatePolicy,
  onUpsertProxy,
  onDeleteProxy,
  onUpsertServer,
  onDeleteServer,
  onRunHealthCheck,
  busy
}) {
  const [proxyMode, setProxyMode] = useState('standard_proxy')
  const [trustedHops, setTrustedHops] = useState(1)
  const [trustedCidrsText, setTrustedCidrsText] = useState('127.0.0.1/32, 10.0.0.0/8')
  const [maxHistory, setMaxHistory] = useState(3)
  const [maxAgeDays, setMaxAgeDays] = useState(0)
  const [enforceAdmin2fa, setEnforceAdmin2fa] = useState(false)

  // Server node form
  const [srvName, setSrvName] = useState('')
  const [srvRole, setSrvRole] = useState('api')
  const [srvRegion, setSrvRegion] = useState('ap-southeast-1')
  const [srvUrl, setSrvUrl] = useState('')

  // Outbound proxy form
  const [prxName, setPrxName] = useState('')
  const [prxProtocol, setPrxProtocol] = useState('http')
  const [prxHost, setPrxHost] = useState('')
  const [prxPort, setPrxPort] = useState(8080)
  const [prxUser, setPrxUser] = useState('')
  const [prxPass, setPrxPass] = useState('')

  useEffect(() => {
    if (networkData?.proxyConfig) {
      setProxyMode(networkData.proxyConfig.mode || 'standard_proxy')
      setTrustedHops(Number(networkData.proxyConfig.trustedHops ?? 1))
      setTrustedCidrsText((networkData.proxyConfig.trustedCidrs || []).join(', '))
    }
    if (networkData?.passwordPolicy) {
      setMaxHistory(Number(networkData.passwordPolicy.maxHistory ?? 3))
      setMaxAgeDays(Number(networkData.passwordPolicy.maxAgeDays ?? 0))
      setEnforceAdmin2fa(Boolean(networkData.passwordPolicy.enforceAdmin2fa))
    }
  }, [networkData])

  const liveChain = networkData?.liveRequestChain || {}
  const serverNodes = networkData?.serverNodes || []
  const proxyServers = networkData?.proxyServers || []

  const handleSaveNetworkPolicy = async () => {
    const trustedCidrs = trustedCidrsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    await onUpdatePolicy({
      proxyConfig: {
        mode: proxyMode,
        trustedHops: Number(trustedHops),
        trustedCidrs
      },
      passwordPolicy: {
        maxHistory: Number(maxHistory),
        maxAgeDays: Number(maxAgeDays),
        enforceAdmin2fa: Boolean(enforceAdmin2fa)
      }
    })
  }

  const handleAddServer = async (e) => {
    e.preventDefault()
    if (!srvName.trim()) return
    await onUpsertServer({
      name: srvName.trim(),
      role: srvRole,
      region: srvRegion.trim() || 'local',
      baseUrl: srvUrl.trim(),
      enabled: true
    })
    setSrvName('')
    setSrvUrl('')
  }

  const handleAddProxy = async (e) => {
    e.preventDefault()
    if (!prxName.trim() || !prxHost.trim()) return
    await onUpsertProxy({
      name: prxName.trim(),
      protocol: prxProtocol,
      host: prxHost.trim(),
      port: Number(prxPort) || 8080,
      username: prxUser.trim(),
      password: prxPass,
      enabled: true
    })
    setPrxName('')
    setPrxHost('')
    setPrxUser('')
    setPrxPass('')
  }

  return (
    <Box>
      {/* 1. Inbound Reverse Proxy Trust & Live IP Chain Inspector + Password/2FA Policy */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>
              Cấu hình Trusted Reverse Proxy, Chuỗi IP Thực tế & Chính sách Bảo mật Tài khoản
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Chống giả mạo X-Forwarded-For (IP Spoofing), kiểm tra chuỗi Proxy trực tiếp và cấu hình chính sách mật khẩu / 2FA.
            </Typography>
          </Box>
          <Button
            size='small'
            variant='contained'
            startIcon={<SaveRoundedIcon />}
            disabled={busy}
            onClick={handleSaveNetworkPolicy}
            sx={{ fontWeight: 800 }}
          >
            Lưu Cấu hình Proxy & Chính sách
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel>Chế độ Giải mã IP (Reverse Proxy Mode)</InputLabel>
            <Select label='Chế độ Giải mã IP (Reverse Proxy Mode)' value={proxyMode} onChange={(e) => setProxyMode(e.target.value)}>
              <MenuItem value='standard_proxy'>Standard Reverse Proxy (Nginx / ALB)</MenuItem>
              <MenuItem value='cloudflare'>Cloudflare Edge (CF-Connecting-IP)</MenuItem>
              <MenuItem value='cidr_whitelist'>Chỉ tin cậy Proxy thuộc CIDR Whitelist</MenuItem>
              <MenuItem value='direct'>Direct Socket (Bỏ qua mọi Header Proxy)</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' fullWidth>
            <InputLabel>Số bước nhảy Proxy tin cậy (Trusted Hops)</InputLabel>
            <Select label='Số bước nhảy Proxy tin cậy (Trusted Hops)' value={trustedHops} onChange={(e) => setTrustedHops(Number(e.target.value))}>
              <MenuItem value={1}>1 Hop (1 Load Balancer / CDN)</MenuItem>
              <MenuItem value={2}>2 Hops (CDN + Ingress Nginx)</MenuItem>
              <MenuItem value={3}>3 Hops</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size='small'
            label='Dải mạng Proxy Tin cậy (Trusted CIDRs)'
            value={trustedCidrsText}
            onChange={(e) => setTrustedCidrsText(e.target.value)}
            placeholder='127.0.0.1/32, 10.0.0.0/8'
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel>Chống trùng mật khẩu cũ (Password History)</InputLabel>
            <Select label='Chống trùng mật khẩu cũ (Password History)' value={maxHistory} onChange={(e) => setMaxHistory(Number(e.target.value))}>
              <MenuItem value={1}>Không cho trùng 1 mật khẩu gần nhất</MenuItem>
              <MenuItem value={3}>Không cho trùng 3 mật khẩu gần nhất (Mặc định)</MenuItem>
              <MenuItem value={5}>Không cho trùng 5 mật khẩu gần nhất</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' fullWidth>
            <InputLabel>Chu kỳ hết hạn mật khẩu (Max Age Days)</InputLabel>
            <Select label='Chu kỳ hết hạn mật khẩu (Max Age Days)' value={maxAgeDays} onChange={(e) => setMaxAgeDays(Number(e.target.value))}>
              <MenuItem value={0}>Không tự động hết hạn (0 ngày)</MenuItem>
              <MenuItem value={60}>60 ngày</MenuItem>
              <MenuItem value={90}>90 ngày</MenuItem>
              <MenuItem value={180}>180 ngày</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ px: 1.5, py: 0.75, borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Bắt buộc 2FA cho Admin</Typography>
              <Typography variant='caption' color='text.secondary'>Mặc định: TẮT (Không bắt buộc)</Typography>
            </Box>
            <Switch
              size='small'
              checked={enforceAdmin2fa}
              onChange={(e) => setEnforceAdmin2fa(e.target.checked)}
              inputProps={{ 'aria-label': 'Bắt buộc 2FA cho Admin' }}
            />
          </Box>
        </Box>

        {/* Live Request IP Chain Inspector */}
        <Box sx={{ p: 1.5, borderRadius: 1.5, border: '1px dashed', borderColor: 'primary.main', bgcolor: 'background.default' }}>
          <EditorialLabel index={1}>LIVE REQUEST IP CHAIN INSPECTOR ( PHIÊN HIỆN TẠI CỦA BẠN )</EditorialLabel>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mt: 1 }}>
            <Box>
              <Typography variant='caption' color='text.secondary'>Resolved Client IP</Typography>
              <Typography variant='body2' sx={{ fontFamily: MONO_FONT, fontWeight: 800, color: 'success.main' }}>
                {liveChain.resolvedClientIp || '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>Direct Socket Peer IP</Typography>
              <Typography variant='body2' sx={{ fontFamily: MONO_FONT, fontWeight: 700 }}>
                {liveChain.socketIp || '—'} ({liveChain.socketTrusted ? 'Trusted' : 'Untrusted'})
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>X-Forwarded-For Chain</Typography>
              <Typography variant='body2' sx={{ fontFamily: MONO_FONT, fontSize: '0.76rem' }}>
                {(liveChain.xffChain || []).join(' -> ') || '(Trống)'}
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>CF-Connecting-IP / X-Real-IP</Typography>
              <Typography variant='body2' sx={{ fontFamily: MONO_FONT, fontSize: '0.76rem' }}>
                {liveChain.cfConnectingIp || liveChain.xRealIp || '(Trống)'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 2. Server Nodes & Upstream Topology Monitor */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>
              Quản lý Cụm Máy chủ & Upstream Nodes (Server Registry & Health Probe)
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Đăng ký các máy chủ thành phần (API Gateway, Database, AI Upstream, Storage) và đo độ trễ phản hồi trực tiếp.
            </Typography>
          </Box>
          <Button
            size='small'
            variant='contained'
            color='info'
            startIcon={<NetworkCheckRoundedIcon />}
            disabled={busy}
            onClick={onRunHealthCheck}
            sx={{ fontWeight: 800 }}
          >
            Kiểm tra Sức khỏe Máy chủ & Proxy ngay
          </Button>
        </Box>

        <Box
          component='form'
          onSubmit={handleAddServer}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '1.5fr 1fr 1fr 2fr auto' }, gap: 1.5, mb: 2, alignItems: 'center' }}
        >
          <TextField size='small' required label='Tên Node / Máy chủ' value={srvName} onChange={(e) => setSrvName(e.target.value)} placeholder='Worker Node 02' />
          <FormControl size='small'>
            <InputLabel>Vai trò</InputLabel>
            <Select label='Vai trò' value={srvRole} onChange={(e) => setSrvRole(e.target.value)}>
              <MenuItem value='api'>API Node</MenuItem>
              <MenuItem value='worker'>Background Worker</MenuItem>
              <MenuItem value='database'>Database</MenuItem>
              <MenuItem value='cache'>Cache / Redis</MenuItem>
              <MenuItem value='ai_upstream'>AI Upstream</MenuItem>
              <MenuItem value='storage'>Storage / CDN</MenuItem>
            </Select>
          </FormControl>
          <TextField size='small' label='Khu vực (Region)' value={srvRegion} onChange={(e) => setSrvRegion(e.target.value)} />
          <TextField size='small' label='Healthcheck URL (Tùy chọn)' value={srvUrl} onChange={(e) => setSrvUrl(e.target.value)} placeholder='https://api.example.com/v1/status' />
          <Button type='submit' variant='outlined' startIcon={<AddCircleOutlineRoundedIcon />} disabled={busy || !srvName.trim()} sx={{ fontWeight: 800, height: 40 }}>
            Thêm Server
          </Button>
        </Box>

        <TableContainer tabIndex={0} role='region' aria-label='Server Nodes' sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 820 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...stickyHeadCellSx, width: 200 }}>Tên Máy chủ</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 110 }}>Vai trò</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 120 }}>Region</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 120 }}>Trạng thái</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 110 }}>Độ trễ Probe</TableCell>
                <TableCell sx={stickyHeadCellSx}>Endpoint / Ghi chú</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 90 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serverNodes.map((node) => (
                <TableRow key={node._id} hover>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {node.name}
                  </TableCell>
                  <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem' }}>{node.role}</TableCell>
                  <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem' }}>{node.region}</TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      color={node.lastStatus === 'healthy' ? 'success' : node.lastStatus === 'degraded' ? 'warning' : 'error'}
                      label={String(node.lastStatus || 'healthy').toUpperCase()}
                      sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20 }}
                    />
                  </TableCell>
                  <TableCell align='right' sx={{ fontFamily: MONO_FONT, fontSize: '0.76rem', fontVariantNumeric: 'tabular-nums' }}>
                    {node.lastLatencyMs != null ? `${node.lastLatencyMs} ms` : '—'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {node.baseUrl || 'Internal Node'}
                  </TableCell>
                  <TableCell align='right'>
                    {!String(node._id).startsWith('srv_') && (
                      <Button size='small' color='error' disabled={busy} onClick={() => onDeleteServer(node._id)} sx={{ fontWeight: 700 }}>
                        Xóa
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 3. Outbound Proxy Pool (AES-256-GCM Encrypted Credentials) */}
      <Box sx={{ ...containmentPanelSx, mb: 0 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>
            Danh sách Outbound Proxy Pool (Mã hóa AES-256-GCM)
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Quản lý các máy chủ Proxy trung gian cho kết nối ra ngoài (Webhook, AI, Google Drive, Telegram). Mật khẩu Proxy được mã hóa AES-256-GCM.
          </Typography>
        </Box>

        <Box
          component='form'
          onSubmit={handleAddProxy}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: '1.3fr 0.9fr 1.4fr 0.8fr 1fr 1fr auto' }, gap: 1.25, mb: 2, alignItems: 'center' }}
        >
          <TextField size='small' required label='Tên Proxy' value={prxName} onChange={(e) => setPrxName(e.target.value)} placeholder='SG Egress Proxy 01' />
          <FormControl size='small'>
            <InputLabel>Giao thức</InputLabel>
            <Select label='Giao thức' value={prxProtocol} onChange={(e) => setPrxProtocol(e.target.value)}>
              <MenuItem value='http'>HTTP</MenuItem>
              <MenuItem value='https'>HTTPS</MenuItem>
              <MenuItem value='socks5'>SOCKS5</MenuItem>
            </Select>
          </FormControl>
          <TextField size='small' required label='Host / IP' value={prxHost} onChange={(e) => setPrxHost(e.target.value)} placeholder='10.20.30.40' />
          <TextField size='small' type='number' required label='Port' value={prxPort} onChange={(e) => setPrxPort(e.target.value)} />
          <TextField size='small' label='Username (Tùy chọn)' value={prxUser} onChange={(e) => setPrxUser(e.target.value)} />
          <TextField size='small' type='password' label='Password (Mã hóa)' value={prxPass} onChange={(e) => setPrxPass(e.target.value)} />
          <Button type='submit' variant='contained' disabled={busy || !prxName.trim() || !prxHost.trim()} sx={{ fontWeight: 800, height: 40, whiteSpace: 'nowrap' }}>
            Thêm Proxy
          </Button>
        </Box>

        <TableContainer tabIndex={0} role='region' aria-label='Outbound Proxy Pool' sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...stickyHeadCellSx, width: 190 }}>Tên Proxy</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 220 }}>Endpoint</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 130 }}>Xác thực</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 120 }}>Trạng thái</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 110 }}>Độ trễ</TableCell>
                <TableCell align='right' sx={stickyHeadCellSx}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proxyServers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 3, color: 'text.secondary' }}>
                    Chưa cấu hình Outbound Proxy nào (Hệ thống đang kết nối trực tiếp Direct Egress).
                  </TableCell>
                </TableRow>
              ) : (
                proxyServers.map((prx) => (
                  <TableRow key={prx._id} hover>
                    <TableCell component='th' scope='row' sx={{ fontWeight: 700 }}>{prx.name}</TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.76rem' }}>
                      {prx.protocol}://{prx.host}:{prx.port}
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem' }}>
                      {prx.hasPassword ? `${prx.username || 'user'} (AES-GCM)` : 'No Auth'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        color={prx.lastStatus === 'healthy' ? 'success' : prx.lastStatus === 'unreachable' ? 'error' : 'default'}
                        label={String(prx.lastStatus || 'untested').toUpperCase()}
                        sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20 }}
                      />
                    </TableCell>
                    <TableCell align='right' sx={{ fontFamily: MONO_FONT, fontSize: '0.76rem', fontVariantNumeric: 'tabular-nums' }}>
                      {prx.lastLatencyMs != null ? `${prx.lastLatencyMs} ms` : '—'}
                    </TableCell>
                    <TableCell align='right'>
                      <Button size='small' color='error' disabled={busy} onClick={() => onDeleteProxy(prx._id)} sx={{ fontWeight: 700 }}>
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default ProxyServerTab
