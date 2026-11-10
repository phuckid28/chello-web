import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CommentIcon from '@mui/icons-material/Comment'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { resolveCardCoverUrl } from '~/utils/animeTheme'
import {
  getCardDevProgress,
  getCardResourceUsed,
  getDeadlineStatus,
  getStatusOption
} from '~/utils/excelExporter'
import { getProgressColor } from '~/utils/progress'
import { playUiChime } from '~/utils/soundEffects'
import { DEFAULT_PRIORITY, getPriorityOption } from '~/utils/crMeta'
import { SPEC_KIT_VERDICTS, auditCrConvergence } from '~/utils/specKitAudit'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useCan } from '~/customHooks/useCan'

const TEMPLATE_DEFAULT_COVER_KEYS = new Set([
  'preset:template-default',
  'preset:cosmos',
  'preset:cosmos-hero',
  'preset:cosmos-galaxy',
  'preset:wind-chime',
  'preset:wind-sky',
  'preset:wind-chime-sky',
  'preset:sora-sky',
  'preset:sora-twilight',
  'preset:sora-usagi',
  'preset:furina',
  'preset:furina-salon',
  'preset:nahida',
  'preset:nahida-sanctuary'
])

function Card({ card }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const board = useSelector(selectCurrentActiveBoard)
  const { tPrimary } = useTranslation()
  const { themeConfig } = usePersonaTheme()
  // v7 roles: only admin / editor may drag CRs between topics
  const canEdit = useCan('board:edit')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card },
    disabled: !canEdit
  })

  const dndKitCardStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : undefined,
    border: isDragging ? '1px solid #38bdf8' : undefined
  }

  const checklistTotal = card?.checklist?.length || 0
  const checklistDone = card?.checklist?.filter(item => item.isCompleted)?.length || 0
  const devProg = getCardDevProgress(card)
  const devPercent = Math.min(100, Math.round(devProg * 100))
  const resourceUsed = getCardResourceUsed(card)
  const frdCount = card?.frdDocuments?.length || 0
  const linkedCount = card?.linkedCardIds?.length || 0
  const srcEvidenceCount = frdCount + linkedCount
  const specAudit = auditCrConvergence(card)
  const showSpecBeacon =
    specAudit.verdict === SPEC_KIT_VERDICTS.CONVERGED ||
    specAudit.verdict === SPEC_KIT_VERDICTS.NEEDS_CLARIFICATION ||
    specAudit.verdict === SPEC_KIT_VERDICTS.CONTRADICTS
  const deadlineInfo = getDeadlineStatus(card)
  const priorityOpt = getPriorityOption(card?.priority)
  const statusOpt = getStatusOption(card?.baStatus)

  const setActiveCard = () => {
    playUiChime('sparkle')
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const handleOpenCrStudio = (e) => {
    e.stopPropagation()
    playUiChime('complete')
    const targetBoardId = card?.boardId || board?._id
    if (targetBoardId) {
      navigate(`/boards/${targetBoardId}/cr/${card._id}`)
    }
  }

  const isSeededTemplateCover = card?.crCode === 'BNPL-945' && TEMPLATE_DEFAULT_COVER_KEYS.has(card?.cover)
  const coverUrl = isSeededTemplateCover ? themeConfig.heroImage : resolveCardCoverUrl(card?.cover)

  const handleCardPointerMove = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${Math.round(e.clientX - rect.left)}px`)
    el.style.setProperty('--spot-y', `${Math.round(e.clientY - rect.top)}px`)
  }

  return (
    <MuiCard
      className="chella-interactive-surface"
      onClick={setActiveCard}
      onMouseMove={handleCardPointerMove}
      ref={setNodeRef} style={dndKitCardStyle} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        borderRadius: 'var(--chella-radius-card, 10px)',
        bgcolor: (theme) => (theme.palette.mode === 'dark'
          ? 'var(--chella-raised-dark, #171f30)'
          : 'var(--chella-raised-light, #ffffff)'),
        boxShadow: card?.FE_PlaceholderCard
          ? 'none'
          : (theme) => (theme.palette.mode === 'dark'
            ? '0 2px 6px rgba(0, 0, 0, 0.38)'
            : '0 1px 3px rgba(15, 23, 42, 0.06)'),
        overflow: 'hidden',
        height: card?.FE_PlaceholderCard ? '0px' : 'unset',
        pointerEvents: card?.FE_PlaceholderCard ? 'none' : 'unset',
        border: card?.FE_PlaceholderCard
          ? '0px solid transparent'
          : deadlineInfo.code === 'overdue'
            ? '1.5px solid rgba(239, 68, 68, 0.65)'
            : (theme) => (theme.palette.mode === 'dark'
              ? '1px solid var(--chella-border, rgba(148, 163, 184, 0.18))'
              : '1px solid rgba(15, 23, 42, 0.09)'),
        transition: 'transform 0.24s var(--chella-spring-curve, cubic-bezier(0.22, 1, 0.36, 1)), box-shadow 0.24s var(--chella-spring-curve, cubic-bezier(0.22, 1, 0.36, 1)), border-color 0.2s ease',
        '& .card-cover-img': {
          transition: 'transform 0.42s var(--chella-spring-curve, cubic-bezier(0.22, 1, 0.36, 1))'
        },
        '&:hover': {
          transform: 'translateY(var(--chella-card-lift, -2.5px))',
          borderColor: 'var(--fx-accent, #38bdf8)',
          boxShadow: (theme) => (theme.palette.mode === 'dark'
            ? 'var(--chella-card-hover-shadow-dark, 0 12px 28px -6px rgba(2, 6, 23, 0.72))'
            : 'var(--chella-card-hover-shadow-light, 0 10px 24px -6px rgba(15, 23, 42, 0.16))'),
          '& .card-cover-img': {
            transform: 'scale(1.035)'
          }
        },
        '&:active': {
          transform: 'scale(var(--chella-card-active-scale, 0.985))'
        }
      }}
    >
      {coverUrl && (
        <Box sx={{ overflow: 'hidden', height: 112 }}>
          <CardMedia
            className='card-cover-img'
            component='img'
            sx={{ height: 112, width: '100%', objectFit: 'cover' }}
            image={coverUrl}
          />
        </Box>
      )}
      <CardContent sx={{ p: 1.35, '&:last-child': { p: 1.35 } }}>
        {/* Precision Ledger Header: Ticket ID + Status Dot + Studio Link */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
            {card?.crCode && (
              <Typography
                component="span"
                sx={{
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'text.secondary',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {card.crCode}
              </Typography>
            )}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.45,
                px: 0.7,
                py: 0.15,
                borderRadius: '5px',
                bgcolor: `${statusOpt.color}18`
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusOpt.color }} />
              <Typography sx={{ fontSize: '0.64rem', fontWeight: 800, color: statusOpt.color, lineHeight: 1.2 }}>
                {statusOpt.value}
              </Typography>
            </Box>
            {card?.priority && card.priority !== DEFAULT_PRIORITY && (
              <Tooltip title={`Priority: ${priorityOpt.label}`}>
                <Box component="span" sx={{ fontSize: '0.74rem', lineHeight: 1 }}>{priorityOpt.icon}</Box>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.45 }}>
            {showSpecBeacon && (
              <Tooltip
                title={`Spec-Kit ${specAudit.verdictMeta.label} (${specAudit.score}%)${
                  specAudit.findings.length > 0 ? ` • ${specAudit.findings[0].message}` : ''
                }`}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 0.55,
                    py: 0.12,
                    borderRadius: '999px',
                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    bgcolor: specAudit.verdictMeta.bg,
                    color: specAudit.verdictMeta.color,
                    border: `1px solid ${specAudit.verdictMeta.color}88`
                  }}
                >
                  {specAudit.beaconLabel}
                </Box>
              </Tooltip>
            )}
            {srcEvidenceCount > 0 && (
              <Tooltip title={`Verified Sources: ${frdCount} FRD • ${linkedCount} Linked`}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    px: 0.55,
                    py: 0.12,
                    borderRadius: '999px',
                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    bgcolor: 'rgba(15, 23, 42, 0.9)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.55)'
                  }}
                >
                  SRC {srcEvidenceCount}
                </Box>
              </Tooltip>
            )}
            <Tooltip title={tPrimary('openCrStudioTooltip')}>
              <Box
                component="span"
                onClick={handleOpenCrStudio}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.2,
                  px: 0.65,
                  py: 0.15,
                  borderRadius: '5px',
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: 'primary.main',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                Studio <NorthEastRoundedIcon aria-hidden="true" sx={{ fontSize: 11 }} />
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {!!card?.labels?.length && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mb: 0.75 }}>
            {card.labels.map((lbl) => (
              <Chip
                key={lbl.id}
                label={lbl.title}
                size="small"
                sx={{
                  height: '18px',
                  maxWidth: '100%',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'white',
                  bgcolor: lbl.color || '#0284c7'
                }}
              />
            ))}
          </Box>
        )}

        <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
          {card?.title}
        </Typography>

        <Box sx={{ mt: 1.1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.35 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.66rem',
                color: 'text.secondary',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '58%'
              }}
            >
              {card?.assignee || 'Unassigned'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {resourceUsed > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                    fontSize: '0.64rem',
                    color: '#10b981',
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {resourceUsed}pt
                </Typography>
              )}
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '0.65rem',
                  color: 'text.primary',
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {devPercent}%
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={devPercent}
            sx={{
              height: 3,
              borderRadius: 2,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                bgcolor: getProgressColor(devProg),
                transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
              }
            }}
          />
        </Box>
      </CardContent>

      {(deadlineInfo.code !== 'none' || frdCount > 0 || linkedCount > 0 || checklistTotal > 0 || !!card?.comments?.length) && (
        <CardActions
          sx={{
            px: 1.35,
            py: 0.75,
            flexWrap: 'wrap',
            gap: 0.5,
            borderTop: (theme) => (theme.palette.mode === 'dark'
              ? '1px solid rgba(148, 163, 184, 0.10)'
              : '1px solid rgba(15, 23, 42, 0.06)')
          }}
        >
          {deadlineInfo.code !== 'none' && (
            <Chip
              icon={<AccessTimeRoundedIcon sx={{ fontSize: '12px !important', color: `${deadlineInfo.color} !important` }} />}
              label={deadlineInfo.shortLabel}
              size="small"
              sx={{
                height: '19px',
                fontSize: '0.64rem',
                fontWeight: 700,
                color: deadlineInfo.color,
                bgcolor: deadlineInfo.bgColor,
                border: `1px solid ${deadlineInfo.color}44`
              }}
            />
          )}
          {frdCount > 0 && (
            <Chip
              icon={<DescriptionOutlinedIcon sx={{ fontSize: '12px !important' }} />}
              label={`${frdCount} FRD`}
              size="small"
              color="info"
              variant="outlined"
              sx={{ height: '19px', fontSize: '0.64rem', fontWeight: 700 }}
            />
          )}
          {linkedCount > 0 && (
            <Chip
              icon={<LinkRoundedIcon sx={{ fontSize: '12px !important' }} />}
              label={linkedCount}
              size="small"
              variant="outlined"
              sx={{ height: '19px', fontSize: '0.64rem', fontWeight: 700 }}
            />
          )}
          {checklistTotal > 0 && (
            <Button
              size="small"
              color={checklistDone === checklistTotal ? 'success' : 'primary'}
              startIcon={<FactCheckOutlinedIcon />}
              sx={{ minWidth: 'unset', px: 0.5, py: 0.1, fontSize: '0.68rem', fontVariantNumeric: 'tabular-nums' }}
            >
              {checklistDone}/{checklistTotal}
            </Button>
          )}
          {!!card?.comments?.length && (
            <Button size="small" startIcon={<CommentIcon />} sx={{ minWidth: 'unset', px: 0.5, py: 0.1, fontSize: '0.68rem', fontVariantNumeric: 'tabular-nums' }}>
              {card?.comments?.length}
            </Button>
          )}
        </CardActions>
      )}
    </MuiCard>
  )
}

export default Card
