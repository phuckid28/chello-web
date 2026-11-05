import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import CallReceivedRoundedIcon from '@mui/icons-material/CallReceivedRounded'
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import { getPriorityOption } from '~/utils/crMeta'
import { getDeadlineStatus, getStatusOption } from '~/utils/excelExporter'
import { formatMessage } from '~/utils/i18nV5'
import { formatProgress, getProgressColor, progressToPercent } from '~/utils/progress'
import { DOWNSTREAM_COLOR, EVIDENCE_BEACON_COLOR, TYPE_COLORS, UPSTREAM_COLOR } from './graphConstants'
import { computeInsights, computeNodeEvidence, computeReachability, memberWorkload, topicProgress } from './graphModel'
import { PanelSection } from './GraphPanelParts'
import { glassSx, rowHoverSx, TEXT_MUTED, TEXT_PRIMARY } from './graphUiStyles'

function SemanticPassportCard({ t, node, graph, activeReach, onToggleReach, onSelectNode }) {
  const evidence = computeNodeEvidence(node, graph)
  const upReach = computeReachability(graph, node.id, 'upstream')
  const downReach = computeReachability(graph, node.id, 'downstream')
  const isUpActive = activeReach?.originId === node.id && activeReach?.direction === 'upstream'
  const isDownActive = activeReach?.originId === node.id && activeReach?.direction === 'downstream'

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: '12px',
        bgcolor: 'rgba(2, 6, 23, 0.78)',
        border: '1px solid rgba(52, 211, 153, 0.28)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
          <VerifiedRoundedIcon aria-hidden="true" sx={{ fontSize: 15, color: EVIDENCE_BEACON_COLOR }} />
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.66rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: TEXT_PRIMARY
            }}
          >
            {t('kgPassportTitle')}
          </Typography>
        </Box>
        {evidence.beaconLabel && (
          <Chip
            size="small"
            label={evidence.beaconLabel}
            sx={{
              height: 19,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.64rem',
              fontWeight: 800,
              bgcolor: 'rgba(15, 23, 42, 0.95)',
              color: EVIDENCE_BEACON_COLOR,
              border: `1px solid ${EVIDENCE_BEACON_COLOR}99`
            }}
          />
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.68rem',
          color: TEXT_MUTED,
          wordBreak: 'break-all'
        }}
      >
        ID: <strong style={{ color: TEXT_PRIMARY }}>{node.id}</strong>
      </Typography>

      {/* Native Authored Reachability Controls (Upstream / Downstream) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
        <Button
          size="small"
          aria-pressed={isUpActive}
          startIcon={<CallReceivedRoundedIcon aria-hidden="true" sx={{ fontSize: 14 }} />}
          onClick={() => onToggleReach?.(node.id, 'upstream')}
          sx={{
            textTransform: 'none',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.68rem',
            fontWeight: 800,
            minBlockSize: 30,
            borderRadius: '8px',
            bgcolor: isUpActive ? `${UPSTREAM_COLOR}30` : 'rgba(15, 23, 42, 0.85)',
            color: UPSTREAM_COLOR,
            border: `1px solid ${isUpActive ? UPSTREAM_COLOR : `${UPSTREAM_COLOR}55`}`,
            '&:hover': { bgcolor: `${UPSTREAM_COLOR}24` }
          }}
        >
          {t('kgUpstream')} ({upReach.nodeCount})
        </Button>
        <Button
          size="small"
          aria-pressed={isDownActive}
          startIcon={<CallMadeRoundedIcon aria-hidden="true" sx={{ fontSize: 14 }} />}
          onClick={() => onToggleReach?.(node.id, 'downstream')}
          sx={{
            textTransform: 'none',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.68rem',
            fontWeight: 800,
            minBlockSize: 30,
            borderRadius: '8px',
            bgcolor: isDownActive ? `${DOWNSTREAM_COLOR}30` : 'rgba(15, 23, 42, 0.85)',
            color: DOWNSTREAM_COLOR,
            border: `1px solid ${isDownActive ? DOWNSTREAM_COLOR : `${DOWNSTREAM_COLOR}55`}`,
            '&:hover': { bgcolor: `${DOWNSTREAM_COLOR}24` }
          }}
        >
          {t('kgDownstream')} ({downReach.nodeCount})
        </Button>
      </Box>

      {/* Verified Source Evidence List (SRC 1..n) */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 800, color: TEXT_MUTED, display: 'block', mb: 0.4 }}>
          {t('kgVerifiedSources')} ({evidence.count})
        </Typography>
        {evidence.count === 0 ? (
          <Typography variant="caption" sx={{ color: TEXT_MUTED, fontStyle: 'italic', fontSize: '0.68rem' }}>
            {t('kgNoEvidence')}
          </Typography>
        ) : (
          <Stack spacing={0.4} sx={{ maxHeight: 132, overflowY: 'auto', pr: 0.25 }}>
            {evidence.sources.map((src, idx) => (
              <Box
                key={src.id}
                onClick={() => {
                  if (src.targetId) onSelectNode?.(src.targetId)
                  else if (src.url) window.open(src.url, '_blank', 'noopener,noreferrer')
                }}
                sx={{
                  ...rowHoverSx,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 0.75,
                  px: 0.85,
                  py: 0.4,
                  cursor: src.targetId || src.url ? 'pointer' : 'default',
                  borderRadius: '6px',
                  bgcolor: 'rgba(15, 23, 42, 0.6)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
                  <Chip
                    size="small"
                    label={`SRC ${idx + 1}`}
                    sx={{
                      height: 16,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      bgcolor: 'rgba(52, 211, 153, 0.16)',
                      color: EVIDENCE_BEACON_COLOR
                    }}
                  />
                  <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: '0.72rem' }}>
                    {src.label}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: TEXT_MUTED,
                    flexShrink: 0
                  }}
                >
                  {src.badge}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

function NodeChipList({ title, ids, graph, emptyText, onSelect }) {
  const nodes = (ids || []).map(id => graph.byId.get(id)).filter(Boolean)
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color: TEXT_MUTED, display: 'block', mb: 0.5 }}>
        {title} ({nodes.length})
      </Typography>
      {nodes.length === 0 ? (
        <Typography variant="caption" sx={{ color: TEXT_MUTED, fontStyle: 'italic' }}>
          {emptyText}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
          {nodes.map(n => (
            <Chip
              key={n.id}
              size="small"
              label={n.type === 'wiki' && n.icon ? `${n.icon} ${n.label}` : n.label}
              onClick={() => onSelect(n.id)}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                bgcolor: 'rgba(148, 163, 184, 0.16)',
                color: TEXT_PRIMARY,
                border: `1px solid ${TYPE_COLORS[n.type] || '#38bdf8'}66`,
                '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.28)' }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function CrDetails({ t, node, graph, accent, secondary, onSelectNode, onOpenCrStudio, onQuickEditCr }) {
  const card = node.card
  const dl = getDeadlineStatus(card)
  const stOpt = getStatusOption(node.status)
  const prioOpt = getPriorityOption(node.priority)
  const pct = progressToPercent(node.progress)
  const isOrphan = graph.orphans.has(node.id)

  return (
    <Stack spacing={1.25}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
        <Chip size="small" label={node.label} sx={{ fontFamily: 'monospace', fontWeight: 800, bgcolor: `${accent}33`, color: TEXT_PRIMARY }} />
        <Chip size="small" label={node.status} sx={{ fontWeight: 700, bgcolor: `${stOpt.color}28`, color: stOpt.color }} />
        <Chip size="small" label={`${prioOpt.icon} ${prioOpt.label}`} sx={{ fontWeight: 700, bgcolor: `${prioOpt.color}26`, color: prioOpt.color }} />
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: TEXT_PRIMARY, lineHeight: 1.3 }}>
        {node.subLabel}
      </Typography>

      <Stack spacing={0.6} sx={{ p: 1.25, borderRadius: '10px', bgcolor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
        <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
          • Topic: <strong style={{ color: TEXT_PRIMARY }}>{node.columnTitle}</strong>
        </Typography>
        <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
          • Handle by: <strong style={{ color: TEXT_PRIMARY }}>{card.assignee || 'Unassigned'}</strong>
        </Typography>
        <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
          • Due date: <strong style={{ color: dl.color }}>{dl.label}</strong>
        </Typography>
        <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
          • Resource used: <strong style={{ color: TEXT_PRIMARY }}>{node.resource} pt</strong>
        </Typography>
        <Box sx={{ pt: 0.4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: TEXT_MUTED }}>Dev Progress</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: getProgressColor(node.progress) }}>{formatProgress(node.progress)}</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(148,163,184,0.2)',
              '& .MuiLinearProgress-bar': { bgcolor: getProgressColor(node.progress), borderRadius: 3 }
            }}
          />
        </Box>
      </Stack>

      {card.note && (
        <Typography variant="caption" sx={{ color: TEXT_MUTED, fontStyle: 'italic' }}>
          “{card.note}”
        </Typography>
      )}

      {isOrphan && (
        <Alert severity="warning" sx={{ py: 0.4, px: 1.25, fontSize: '0.74rem', borderRadius: '10px' }}>
          {t('kgOrphanWarning')}
        </Alert>
      )}

      <NodeChipList title={t('kgBacklinks')} ids={graph.inLinks.get(node.id)} graph={graph} emptyText={t('kgNoLinks')} onSelect={onSelectNode} />
      <NodeChipList title={t('kgOutgoingLinks')} ids={graph.outLinks.get(node.id)} graph={graph} emptyText={t('kgNoLinks')} onSelect={onSelectNode} />

      <Stack spacing={0.85} sx={{ pt: 0.5 }}>
        <Button
          variant="contained"
          fullWidth
          size="small"
          startIcon={<PlayCircleFilledWhiteRoundedIcon />}
          onClick={() => onOpenCrStudio(node.cardId)}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '10px',
            py: 0.9,
            background: `linear-gradient(135deg, ${accent} 0%, ${secondary} 100%)`,
            color: '#0b1020'
          }}
        >
          {t('kgOpenCrStudio')}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<OpenInNewRoundedIcon />}
          onClick={() => onQuickEditCr({ ...card, columnTitle: node.columnTitle })}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', color: TEXT_PRIMARY, borderColor: 'rgba(148,163,184,0.35)' }}
        >
          {t('kgQuickEditCr')}
        </Button>
      </Stack>
    </Stack>
  )
}

function InsightsSection({ t, graph, accent, onSelectNode }) {
  const insights = computeInsights(graph)
  return (
    <PanelSection title={t('kgSectionInsights')} defaultOpen={true}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(15,23,42,0.55)' }}>
          <Typography variant="caption" sx={{ color: TEXT_MUTED, display: 'block' }}>{t('kgInsightNodes')}</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: TEXT_PRIMARY }}>
            {insights.nodeCount} / {insights.edgeCount}
          </Typography>
        </Box>
        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(15,23,42,0.55)' }}>
          <Typography variant="caption" sx={{ color: TEXT_MUTED, display: 'block' }}>{t('kgInsightOrphans')}</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: insights.orphanCrIds.length ? '#fbbf24' : '#10b981' }}>
            {insights.orphanCrIds.length} / {insights.crCount}
          </Typography>
        </Box>
      </Box>

      {insights.isolatedOverdueIds.length > 0 && (
        <NodeChipList
          title={`⚠️ ${t('kgInsightOverdueOrphans')}`}
          ids={insights.isolatedOverdueIds}
          graph={graph}
          emptyText=""
          onSelect={onSelectNode}
        />
      )}

      {insights.hubs.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: TEXT_MUTED, display: 'block', mb: 0.5 }}>
            {t('kgInsightTopHubs')}
          </Typography>
          <Stack spacing={0.4}>
            {insights.hubs.map(h => (
              <Box
                key={h.id}
                onClick={() => onSelectNode(h.id)}
                sx={{ ...rowHoverSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.45, cursor: 'pointer' }}
              >
                <Typography variant="body2" noWrap sx={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT_PRIMARY }}>
                  {h.label}
                </Typography>
                <Chip size="small" label={h.degree} sx={{ height: 18, fontSize: '0.66rem', fontWeight: 800, bgcolor: `${accent}33`, color: TEXT_PRIMARY }} />
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </PanelSection>
  )
}

function GraphInspector({
  t, graph, selectedNode, isPinned, accent, secondary, activeReach,
  onSelectNode, onTogglePin, onOpenLocal, onToggleReach, onOpenCrStudio, onQuickEditCr, onOpenWikiPage, embedded = false
}) {
  const neighbors = selectedNode ? Array.from(graph.adjacency.get(selectedNode.id) || []) : []
  const workload = selectedNode?.type === 'member' ? memberWorkload(graph, selectedNode.id) : null
  const topicStat = selectedNode?.type === 'topic' ? topicProgress(graph, selectedNode.id) : null

  return (
    <Box sx={{ ...(embedded ? {} : glassSx), height: '100%', overflowY: 'auto', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {selectedNode ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
            <Chip
              size="small"
              label={selectedNode.type.toUpperCase()}
              sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: TYPE_COLORS[selectedNode.type] || accent, color: '#0b1020' }}
            />
            <Box>
              <Tooltip title={isPinned ? t('kgUnpinNode') : t('kgPinNode')}>
                <IconButton size="small" aria-pressed={isPinned} onClick={() => onTogglePin(selectedNode.id)} sx={{ color: isPinned ? '#fbbf24' : TEXT_MUTED }}>
                  <PushPinRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={`${t('kgFocusLocal')} (L)`}>
                <IconButton size="small" onClick={() => onOpenLocal(selectedNode.id)} sx={{ color: accent }}>
                  <HubRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <SemanticPassportCard
            t={t}
            node={selectedNode}
            graph={graph}
            activeReach={activeReach}
            onToggleReach={onToggleReach}
            onSelectNode={onSelectNode}
          />

          {selectedNode.type === 'cr' ? (
            <CrDetails
              t={t}
              node={selectedNode}
              graph={graph}
              accent={accent}
              secondary={secondary}
              onSelectNode={onSelectNode}
              onOpenCrStudio={onOpenCrStudio}
              onQuickEditCr={onQuickEditCr}
            />
          ) : (
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: TEXT_PRIMARY, lineHeight: 1.25 }}>
                {selectedNode.icon ? `${selectedNode.icon} ${selectedNode.label}` : selectedNode.label}
              </Typography>
              <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
                {selectedNode.subLabel}
              </Typography>

              {selectedNode.type === 'member' && workload && (
                <Typography variant="body2" sx={{ fontWeight: 700, color: accent }}>
                  {formatMessage(t('kgMemberWorkload'), { count: workload.crs.length, points: workload.points })}
                </Typography>
              )}

              {selectedNode.type === 'topic' && topicStat && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: accent, mb: 0.5 }}>
                    {formatMessage(t('kgTopicSummary'), { count: topicStat.count, avg: formatProgress(topicStat.average) })}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progressToPercent(topicStat.average)}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(148,163,184,0.2)', '& .MuiLinearProgress-bar': { bgcolor: getProgressColor(topicStat.average) } }}
                  />
                </Box>
              )}

              {selectedNode.type === 'wiki' && (
                <>
                  <NodeChipList title={t('kgBacklinks')} ids={graph.inLinks.get(selectedNode.id)} graph={graph} emptyText={t('kgNoLinks')} onSelect={onSelectNode} />
                  <NodeChipList title={t('kgOutgoingLinks')} ids={graph.outLinks.get(selectedNode.id)} graph={graph} emptyText={t('kgNoLinks')} onSelect={onSelectNode} />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<OpenInNewRoundedIcon />}
                    onClick={() => onOpenWikiPage(selectedNode.pageId)}
                    sx={{ mt: 1, fontWeight: 800, borderRadius: '10px', textTransform: 'none', bgcolor: TYPE_COLORS.wiki, color: '#0b1020' }}
                  >
                    {t('kgOpenWikiPage')}
                  </Button>
                </>
              )}

              {selectedNode.type !== 'wiki' && (
                <NodeChipList title={t('kgConnectedNodes')} ids={neighbors} graph={graph} emptyText={t('kgNoLinks')} onSelect={onSelectNode} />
              )}
            </Stack>
          )}
        </>
      ) : (
        <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
          {t('kgEmptyHint')}
        </Typography>
      )}

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.16)' }} />
      <InsightsSection t={t} graph={graph} accent={accent} onSelectNode={onSelectNode} />
    </Box>
  )
}

export default GraphInspector
