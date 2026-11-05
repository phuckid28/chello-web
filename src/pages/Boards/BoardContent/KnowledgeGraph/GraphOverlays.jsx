import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded'
import CallReceivedRoundedIcon from '@mui/icons-material/CallReceivedRounded'
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded'
import { formatDateTime, formatMessage } from '~/utils/i18nV5'
import { DOWNSTREAM_COLOR, PATH_COLOR, TYPE_COLORS, UPSTREAM_COLOR } from './graphConstants'
import { glassSx, TEXT_MUTED, TEXT_PRIMARY } from './graphUiStyles'

// Shortest-path explorer banner shown when Path Finder mode is active
export function PathFinderBar({ t, graph, fromId, toId, path, onPickNode, onSwap, onExportShareCard, onClear }) {
  const fromNode = fromId ? graph.byId.get(fromId) : null
  const toNode = toId ? graph.byId.get(toId) : null
  const hops = path && path.length > 1 ? path.length - 1 : 0

  return (
    <Box
      sx={{
        ...glassSx,
        position: 'absolute',
        top: 66,
        left: 12,
        zIndex: 3,
        px: 1.5,
        py: 0.85,
        maxWidth: 'calc(100% - 24px)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 800, color: PATH_COLOR }}>
        🧭 {t('kgPathFrom')}:
      </Typography>
      <Chip
        size="small"
        label={fromNode ? fromNode.label : '—'}
        onClick={() => fromNode && onPickNode(fromNode.id)}
        sx={{ fontWeight: 700, bgcolor: fromNode ? 'rgba(34,211,238,0.22)' : 'rgba(148,163,184,0.16)', color: TEXT_PRIMARY }}
      />
      <IconButton size="small" onClick={onSwap} disabled={!fromId && !toId} sx={{ color: TEXT_MUTED, p: 0.35 }} title={t('kgPathSwap')}>
        <SwapHorizRoundedIcon fontSize="small" />
      </IconButton>
      <Typography variant="caption" sx={{ fontWeight: 800, color: PATH_COLOR }}>
        {t('kgPathTo')}:
      </Typography>
      <Chip
        size="small"
        label={toNode ? toNode.label : '—'}
        onClick={() => toNode && onPickNode(toNode.id)}
        sx={{ fontWeight: 700, bgcolor: toNode ? 'rgba(34,211,238,0.22)' : 'rgba(148,163,184,0.16)', color: TEXT_PRIMARY }}
      />

      {!fromId || !toId ? (
        <Typography variant="caption" sx={{ color: TEXT_MUTED, ml: 0.5 }}>
          {t('kgPathPickHint')}
        </Typography>
      ) : path ? (
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" sx={{ ml: 0.5 }}>
          <Chip
            size="small"
            label={formatMessage(t('kgPathHops'), { n: hops })}
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: PATH_COLOR, color: '#0b1020' }}
          />
          {path.map((id, idx) => {
            const node = graph.byId.get(id)
            return (
              <Box key={id} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
                {idx > 0 && <ArrowForwardRoundedIcon sx={{ fontSize: 13, color: PATH_COLOR }} />}
                <Chip
                  size="small"
                  label={node?.label || id}
                  onClick={() => onPickNode(id)}
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', bgcolor: 'rgba(148,163,184,0.18)', color: TEXT_PRIMARY }}
                />
              </Box>
            )
          })}
        </Stack>
      ) : (
        <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700, ml: 0.5 }}>
          {t('kgPathNoRoute')}
        </Typography>
      )}

      <Box sx={{ ml: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
        {path && path.length > 1 && onExportShareCard && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<IosShareRoundedIcon aria-hidden="true" />}
            onClick={onExportShareCard}
            sx={{
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 800,
              minBlockSize: 28,
              borderRadius: '8px',
              borderColor: `${PATH_COLOR}88`,
              color: PATH_COLOR
            }}
          >
            {t('kgExportShareCard')}
          </Button>
        )}
        <Button size="small" startIcon={<CloseRoundedIcon aria-hidden="true" />} onClick={onClear} sx={{ textTransform: 'none', color: TEXT_MUTED, minWidth: 0, minBlockSize: 28 }}>
          {t('kgPathClear')}
        </Button>
      </Box>
    </Box>
  )
}

// Archify Authored Reachability banner (Upstream / Downstream receipt & Share Card trigger)
export function ReachabilityBar({ t, graph, reach, onPickNode, onDirectionChange, onExportShareCard, onClear }) {
  if (!reach || !reach.originId) return null
  const originNode = graph.byId.get(reach.originId)
  const isUp = reach.direction === 'upstream'
  const badgeColor = isUp ? UPSTREAM_COLOR : DOWNSTREAM_COLOR

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        ...glassSx,
        position: 'absolute',
        top: 66,
        left: 12,
        zIndex: 3,
        px: 1.5,
        py: 0.85,
        maxWidth: 'calc(100% - 24px)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        borderLeft: `3px solid ${badgeColor}`
      }}
    >
      <Chip
        size="small"
        label={isUp ? 'UPSTREAM' : 'DOWNSTREAM'}
        sx={{
          height: 22,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.68rem',
          fontWeight: 800,
          bgcolor: `${badgeColor}26`,
          color: badgeColor,
          border: `1px solid ${badgeColor}88`
        }}
      />

      <Chip
        size="small"
        label={originNode ? originNode.label : reach.originId}
        onClick={() => originNode && onPickNode(originNode.id)}
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          color: TEXT_PRIMARY,
          border: '1px solid rgba(148, 163, 184, 0.35)'
        }}
      />

      <Typography
        variant="caption"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          color: badgeColor,
          px: 0.5
        }}
      >
        {formatMessage(t('kgReachSummary'), {
          nodes: reach.nodeCount,
          links: reach.linkCount,
          hops: reach.maxHops
        })}
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Button
          size="small"
          aria-pressed={isUp}
          startIcon={<CallReceivedRoundedIcon aria-hidden="true" sx={{ fontSize: 15 }} />}
          onClick={() => onDirectionChange('upstream')}
          sx={{
            textTransform: 'none',
            fontSize: '0.72rem',
            fontWeight: 800,
            minBlockSize: 28,
            px: 1,
            borderRadius: '8px',
            bgcolor: isUp ? `${UPSTREAM_COLOR}28` : 'transparent',
            color: isUp ? UPSTREAM_COLOR : TEXT_MUTED,
            border: `1px solid ${isUp ? UPSTREAM_COLOR : 'rgba(148,163,184,0.24)'}`
          }}
        >
          {t('kgUpstream')} (U)
        </Button>
        <Button
          size="small"
          aria-pressed={!isUp}
          startIcon={<CallMadeRoundedIcon aria-hidden="true" sx={{ fontSize: 15 }} />}
          onClick={() => onDirectionChange('downstream')}
          sx={{
            textTransform: 'none',
            fontSize: '0.72rem',
            fontWeight: 800,
            minBlockSize: 28,
            px: 1,
            borderRadius: '8px',
            bgcolor: !isUp ? `${DOWNSTREAM_COLOR}28` : 'transparent',
            color: !isUp ? DOWNSTREAM_COLOR : TEXT_MUTED,
            border: `1px solid ${!isUp ? DOWNSTREAM_COLOR : 'rgba(148,163,184,0.24)'}`
          }}
        >
          {t('kgDownstream')} (D)
        </Button>
      </Stack>

      <Box sx={{ ml: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
        {onExportShareCard && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<IosShareRoundedIcon aria-hidden="true" />}
            onClick={onExportShareCard}
            sx={{
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 800,
              minBlockSize: 28,
              borderRadius: '8px',
              borderColor: `${badgeColor}88`,
              color: badgeColor
            }}
          >
            {t('kgExportShareCard')}
          </Button>
        )}
        <Button
          size="small"
          startIcon={<CloseRoundedIcon aria-hidden="true" />}
          onClick={onClear}
          sx={{ textTransform: 'none', color: TEXT_MUTED, minWidth: 0, minBlockSize: 28 }}
        >
          {t('kgPathClear')}
        </Button>
      </Box>
    </Box>
  )
}

// Chronological growth replay bar
export function TimelapseBar({ t, lang, timeline, stepIndex, playing, accent, onStepChange, onTogglePlay, onClose }) {
  const total = timeline.length
  const currentTs = timeline[Math.min(stepIndex, total - 1)]

  return (
    <Box
      sx={{
        ...glassSx,
        position: 'absolute',
        bottom: 52,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        px: 1.75,
        py: 0.75,
        width: { xs: 'calc(100% - 24px)', sm: 460 },
        display: 'flex',
        alignItems: 'center',
        gap: 1.25
      }}
    >
      <IconButton
        size="small"
        onClick={onTogglePlay}
        aria-label={playing ? t('kgTimelapsePause') : t('kgTimelapsePlay')}
        sx={{ bgcolor: accent, color: '#0b1020', '&:hover': { bgcolor: accent } }}
      >
        {playing ? <PauseRoundedIcon fontSize="small" /> : <PlayArrowRoundedIcon fontSize="small" />}
      </IconButton>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: TEXT_PRIMARY }}>
            {formatMessage(t('kgTimelapseStep'), { current: stepIndex + 1, total })}
          </Typography>
          <Typography variant="caption" sx={{ color: TEXT_MUTED }} noWrap>
            {formatDateTime(currentTs, lang)}
          </Typography>
        </Box>
        <Slider
          size="small"
          min={0}
          max={Math.max(0, total - 1)}
          step={1}
          value={Math.min(stepIndex, Math.max(0, total - 1))}
          onChange={(_, v) => onStepChange(Number(v))}
          sx={{ py: 0.4, color: accent }}
        />
      </Box>
      <IconButton size="small" onClick={onClose} sx={{ color: TEXT_MUTED }}>
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

export function GraphLegend({ t, accent, showTags }) {
  const items = [
    { label: 'Sprint', color: accent },
    { label: t('kgTypeTopic'), color: TYPE_COLORS.topic },
    { label: 'CR', color: '#10b981' },
    { label: 'Handle by', color: TYPE_COLORS.member },
    { label: 'FRD', color: TYPE_COLORS.frd },
    { label: 'Knowledge Hub', color: TYPE_COLORS.wiki },
    ...(showTags ? [{ label: '#Tag', color: TYPE_COLORS.tag }] : [])
  ]

  return (
    <Box
      sx={{
        ...glassSx,
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 2,
        px: 1.35,
        py: 0.6,
        borderRadius: '10px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.25,
        pointerEvents: 'none'
      }}
    >
      {items.map(item => (
        <Box key={item.label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
          <Typography variant="caption" sx={{ color: TEXT_PRIMARY, fontWeight: 700, fontSize: '0.68rem' }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
