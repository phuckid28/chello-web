import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch } from 'react-redux'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { resolveCardCoverUrl } from '~/utils/animeTheme'
import { playUiChime } from '~/utils/soundEffects'

function Card({ card }) {
  const dispatch = useDispatch()
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
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0

  const shouldShowCardActions = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length || checklistTotal > 0
  }

  const setActiveCard = () => {
    playUiChime('sparkle')
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
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
        border: card?.FE_PlaceholderCard ? '0px solid transparent' : '1px solid rgba(148, 163, 184, 0.22)',
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
        <Box sx={{ overflow: 'hidden', height: 142 }}>
          <CardMedia
            className='card-cover-img'
            component='img'
            sx={{ height: 142, width: '100%', objectFit: 'cover' }}
            image={coverUrl}
          />
        </Box>
      )}
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        {!!card?.labels?.length && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {card.labels.map((lbl) => (
              <Chip
                key={lbl.id}
                label={lbl.title}
                size="small"
                sx={{
                  height: '20px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'white',
                  bgcolor: lbl.color || '#0284c7'
                }}
              />
            ))}
          </Box>
        )}
        <Typography sx={{ fontWeight: 600, lineHeight: 1.38 }}>
          {card?.title}
        </Typography>

        {checklistTotal > 0 && (
          <Box sx={{ mt: 1.25 }}>
            <LinearProgress
              variant="determinate"
              value={checklistPercent}
              color={checklistDone === checklistTotal ? 'success' : 'primary'}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        )}
      </CardContent>
      {shouldShowCardActions() &&
      <CardActions sx={{ p: '0 6px 8px 6px', flexWrap: 'wrap', gap: 0.5 }}>
        {checklistTotal > 0 && (
          <Button
            size="small"
            color={checklistDone === checklistTotal ? 'success' : 'primary'}
            startIcon={<FactCheckOutlinedIcon />}
          >
            {checklistDone}/{checklistTotal}
          </Button>
        )}
        {!!card?.memberIds?.length &&
        <Button size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>}
        {!!card?.comments?.length &&
        <Button size="small" startIcon={<CommentIcon />}>{card?.comments?.length}</Button>}
        {!!card?.attachments?.length &&
        <Button size="small" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>}
      </CardActions>
      }
    </MuiCard>
  )
}

export default Card
