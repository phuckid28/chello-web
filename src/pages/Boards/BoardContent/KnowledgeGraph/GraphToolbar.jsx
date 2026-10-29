import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded'
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded'
import RouteRoundedIcon from '@mui/icons-material/RouteRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded'
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { LOCAL_DEPTHS } from './graphConstants'
import { glassSx, TEXT_MUTED, TEXT_PRIMARY, toolbarButtonSx } from './graphUiStyles'

function ToolbarButton({ label, active = false, disabled = false, accent, onClick, children }) {
  return (
    <Tooltip title={label} arrow disableInteractive>
      <span>
        <IconButton size="small" aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick} sx={toolbarButtonSx(active, accent)}>
          {children}
        </IconButton>
      </span>
    </Tooltip>
  )
}

const Divider = () => <Box sx={{ width: 1, height: 22, bgcolor: 'rgba(148, 163, 184, 0.22)', mx: 0.25 }} />

// Floating glass toolbar: search slot, Local / Global, tools and view actions
function GraphToolbar({ t, accent, sprintName, mode, onModeChange, depth, onDepthChange, flags, actions, children }) {
  return (
    <Box
      sx={{
        ...glassSx,
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        zIndex: 4,
        px: 1.25,
        py: 0.75,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 0.75,
        animation: 'kgToolbarIn 0.45s ease both',
        '@keyframes kgToolbarIn': { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'none' } },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
      }}
    >
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.75, pr: 0.5 }}>
        <HubRoundedIcon sx={{ color: accent, fontSize: 22 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: TEXT_PRIMARY, lineHeight: 1.15 }} noWrap>{t('kgTitle')}</Typography>
          <Typography variant="caption" sx={{ color: TEXT_MUTED, lineHeight: 1 }} noWrap>{sprintName}</Typography>
        </Box>
      </Box>

      {children}

      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_, value) => value && onModeChange(value)}
        sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.74rem', fontWeight: 700, py: 0.35, px: 1, color: TEXT_MUTED, borderColor: 'rgba(148,163,184,0.25)', '&.Mui-selected': { color: '#0b1020', bgcolor: accent, '&:hover': { bgcolor: accent } } } }}
      >
        <ToggleButton value="global">{t('kgGlobalGraph')}</ToggleButton>
        <ToggleButton value="local" disabled={!flags.canLocal}>{t('kgLocalGraph')}</ToggleButton>
      </ToggleButtonGroup>

      {mode === 'local' && (
        <ToggleButtonGroup
          exclusive
          size="small"
          value={depth}
          aria-label={t('kgDepth')}
          onChange={(_, value) => value && onDepthChange(value)}
          sx={{ '& .MuiToggleButton-root': { fontSize: '0.74rem', fontWeight: 800, py: 0.35, px: 0.9, color: TEXT_MUTED, borderColor: 'rgba(148,163,184,0.25)', '&.Mui-selected': { color: '#0b1020', bgcolor: accent, '&:hover': { bgcolor: accent } } } }}
        >
          {LOCAL_DEPTHS.map(d => <ToggleButton key={d} value={d}>{d}</ToggleButton>)}
        </ToggleButtonGroup>
      )}

      <Box sx={{ flex: { xs: 0, md: 1 } }} />

      <ToolbarButton label={t('kgPathFinder')} accent={accent} active={flags.pathMode} onClick={actions.togglePath}><RouteRoundedIcon fontSize="small" /></ToolbarButton>
      <ToolbarButton label={t('kgTimelapse')} accent={accent} active={flags.timelapseOn} disabled={!flags.timelapseAvailable} onClick={actions.toggleTimelapse}><HistoryRoundedIcon fontSize="small" /></ToolbarButton>
      <ToolbarButton label={t('kgFilters')} accent={accent} active={flags.filtersOpen} onClick={actions.toggleFilters}><TuneRoundedIcon fontSize="small" /></ToolbarButton>
      <Divider />
      <ToolbarButton label={t('kgZoomOut')} accent={accent} onClick={actions.zoomOut}><ZoomOutRoundedIcon fontSize="small" /></ToolbarButton>
      <ToolbarButton label={t('kgZoomIn')} accent={accent} onClick={actions.zoomIn}><ZoomInRoundedIcon fontSize="small" /></ToolbarButton>
      <ToolbarButton label={`${t('kgFit')} (F)`} accent={accent} onClick={actions.fit}><CenterFocusStrongRoundedIcon fontSize="small" /></ToolbarButton>
      <Divider />
      <ToolbarButton label={t('kgExportPng')} accent={accent} onClick={actions.exportPng}><ImageRoundedIcon fontSize="small" /></ToolbarButton>
      <ToolbarButton label={flags.fullscreen ? t('kgExitFullscreen') : t('kgFullscreen')} accent={accent} active={flags.fullscreen} onClick={actions.toggleFullscreen}>
        {flags.fullscreen ? <FullscreenExitRoundedIcon fontSize="small" /> : <FullscreenRoundedIcon fontSize="small" />}
      </ToolbarButton>
      <ToolbarButton label={t('kgInspector')} accent={accent} active={flags.inspectorOpen} onClick={actions.toggleInspector}><InfoOutlinedIcon fontSize="small" /></ToolbarButton>
    </Box>
  )
}

export default GraphToolbar
