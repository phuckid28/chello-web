import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
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

function Card({ card }) {
  const dispatch = useDispatch()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })

  const dndKitCardStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #38bdf8' : undefined
  }

  const checklistTotal = card?.checklist?.length || 0
  const checklistDone = card?.checklist?.filter(item => item.isCompleted)?.length || 0

  const shouldShowCardActions = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length || checklistTotal > 0
  }

  const setActiveCard = () => {
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
        borderRadius: '10px',
        boxShadow: card?.FE_PlaceholderCard ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.14)',
        overflow: card?.FE_PlaceholderCard ? 'hidden' : 'unset',
        height: card?.FE_PlaceholderCard ? '0px' : 'unset',
        pointerEvents: card?.FE_PlaceholderCard ? 'none' : 'unset',
        border: card?.FE_PlaceholderCard ? '0px solid transparent' : '1px solid rgba(148, 163, 184, 0.2)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        '&:hover': {
          borderColor: (theme) => theme.palette.primary.main,
          boxShadow: '0 6px 16px rgba(56, 189, 248, 0.25)'
        }
      }}
    >
      {coverUrl && (
        <CardMedia
          component='img'
          sx={{ height: 140, borderTopLeftRadius: '10px', borderTopRightRadius: '10px', objectFit: 'cover' }}
          image={coverUrl}
        />
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
        <Typography sx={{ fontWeight: 600 }}>
          {card?.title}
        </Typography>
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
