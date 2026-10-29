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
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded'

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
import { playUiChime } from '~/utils/soundEffects'
import { DEFAULT_PRIORITY, getPriorityOption } from '~/utils/crMeta'

function Card({ card }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const board = useSelector(selectCurrentActiveBoard)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })

  const dndKitCardStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : undefined,
    border: isDragging ? '1px solid #7dd3fc' : undefined
  }

  const checklistTotal = card?.checklist?.length || 0
  const checklistDone = card?.checklist?.filter(item => item.isCompleted)?.length || 0
  const devProg = getCardDevProgress(card)
  const devPercent = Math.min(100, Math.round(devProg * 100))
  const resourceUsed = getCardResourceUsed(card)
  const frdCount = card?.frdDocuments?.length || 0
  const linkedCount = card?.linkedCardIds?.length || 0
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

  const coverUrl = resolveCardCoverUrl(card?.cover)

  return (
    <MuiCard
      onClick={setActiveCard}
      ref={setNodeRef} style={dndKitCardStyle} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        borderRadius: '11px',
        boxShadow: card?.FE_PlaceholderCard ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.14)',
        overflow: 'hidden',
        height: card?.FE_PlaceholderCard ? '0px' : 'unset',
        pointerEvents: card?.FE_PlaceholderCard ? 'none' : 'unset',
        border: card?.FE_PlaceholderCard
          ? '0px solid transparent'
          : deadlineInfo.code === 'overdue'
            ? '1.5px solid rgba(239, 68, 68, 0.65)'
            : '1px solid rgba(148, 163, 184, 0.22)',
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease',
        '& .card-cover-img': {
          transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)'
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: (theme) => theme.palette.primary.main,
          boxShadow: '0 10px 24px -6px rgba(125, 211, 252, 0.35), 0 4px 12px rgba(244, 114, 182, 0.18)',
          '& .card-cover-img': {
            transform: 'scale(1.06)'
          }
        }
      }}
    >
      {coverUrl && (
        <Box sx={{ overflow: 'hidden', height: 136 }}>
          <CardMedia
            className='card-cover-img'
            component='img'
            sx={{ height: 136, width: '100%', objectFit: 'cover' }}
            image={coverUrl}
          />
        </Box>
      )}
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            {card?.priority && card.priority !== DEFAULT_PRIORITY && (
              <Tooltip title={`Priority: ${priorityOpt.label}`}>
                <Box component="span" sx={{ fontSize: '0.8rem', lineHeight: 1, cursor: 'default' }}>{priorityOpt.icon}</Box>
              </Tooltip>
            )}
            {card?.crCode && (
              <Chip
                label={card.crCode}
                size="small"
                sx={{
                  height: '20px',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  bgcolor: 'rgba(56, 189, 248, 0.16)',
                  border: '1px solid rgba(56, 189, 248, 0.45)'
                }}
              />
            )}
            <Chip
              label={statusOpt.value}
              size="small"
              sx={{
                height: '20px',
                fontSize: '0.65rem',
                fontWeight: 800,
                color: statusOpt.color,
                bgcolor: `${statusOpt.color}1f`
              }}
            />
          </Box>

          <Tooltip title="Mở Trang Riêng CR Studio & Mô Phỏng Luồng">
            <Chip
              icon={<PlayCircleFilledWhiteRoundedIcon sx={{ fontSize: '13px !important' }} />}
              label="Studio"
              size="small"
              color="info"
              variant="outlined"
              onClick={handleOpenCrStudio}
              clickable
              sx={{ height: '20px', fontSize: '0.64rem', fontWeight: 800 }}
            />
          </Tooltip>
        </Box>

        {!!card?.labels?.length && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.85 }}>
            {card.labels.map((lbl) => (
              <Chip
                key={lbl.id}
                label={lbl.title}
                size="small"
                sx={{
                  height: '19px',
                  maxWidth: '100%',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'white',
                  bgcolor: lbl.color || '#0284c7'
                }}
              />
            ))}
          </Box>
        )}

        <Typography sx={{ fontWeight: 600, lineHeight: 1.38, wordBreak: 'break-word' }}>
          {card?.title}
        </Typography>

        {card?.assignee && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.6,
              color: 'text.secondary',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            👤 {card.assignee}
          </Typography>
        )}

        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700 }}>
              Dev Progress: {devProg}
            </Typography>
            {resourceUsed > 0 && (
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800 }}>
                Res: {resourceUsed}
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={devPercent}
            color={devProg >= 1 ? 'success' : 'primary'}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ p: '0 10px 10px 10px', flexWrap: 'wrap', gap: 0.5 }}>
        {deadlineInfo.code !== 'none' && (
          <Chip
            icon={<AccessTimeRoundedIcon sx={{ fontSize: '13px !important', color: `${deadlineInfo.color} !important` }} />}
            label={deadlineInfo.shortLabel}
            size="small"
            sx={{
              height: '21px',
              fontSize: '0.66rem',
              fontWeight: 700,
              color: deadlineInfo.color,
              bgcolor: deadlineInfo.bgColor,
              border: `1px solid ${deadlineInfo.color}55`
            }}
          />
        )}
        {frdCount > 0 && (
          <Chip
            icon={<DescriptionOutlinedIcon sx={{ fontSize: '13px !important' }} />}
            label={`${frdCount} FRD`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ height: '21px', fontSize: '0.66rem', fontWeight: 700 }}
          />
        )}
        {linkedCount > 0 && (
          <Chip
            icon={<LinkRoundedIcon sx={{ fontSize: '13px !important' }} />}
            label={linkedCount}
            size="small"
            variant="outlined"
            sx={{ height: '21px', fontSize: '0.66rem', fontWeight: 700 }}
          />
        )}
        {checklistTotal > 0 && (
          <Button
            size="small"
            color={checklistDone === checklistTotal ? 'success' : 'primary'}
            startIcon={<FactCheckOutlinedIcon />}
            sx={{ minWidth: 'unset', px: 0.6, py: 0.2, fontSize: '0.7rem' }}
          >
            {checklistDone}/{checklistTotal}
          </Button>
        )}
        {!!card?.comments?.length && (
          <Button size="small" startIcon={<CommentIcon />} sx={{ minWidth: 'unset', px: 0.6, py: 0.2, fontSize: '0.7rem' }}>
            {card?.comments?.length}
          </Button>
        )}
      </CardActions>
    </MuiCard>
  )
}

export default Card
