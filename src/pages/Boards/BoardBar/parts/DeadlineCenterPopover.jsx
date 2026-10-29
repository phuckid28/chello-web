import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { useDispatch } from 'react-redux'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { useTranslation } from '~/customHooks/useTranslation'

function DeadlineCenterPopover({ anchorEl, onClose, telemetry }) {
  const dispatch = useDispatch()
  const { tPrimary } = useTranslation()
  const items = [...telemetry.overdueCards, ...telemetry.dueSoonCards]

  const openCard = (card) => {
    onClose()
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  return (
    <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Box sx={{ p: 2.5, width: 400, maxWidth: '94vw', maxHeight: 460, overflowY: 'auto' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>{tPrimary('deadlineCenterTitle')}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>{tPrimary('deadlineCenterSub')}</Typography>

        {items.length === 0 ? (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.12)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>{tPrimary('allOnTrackMsg')}</Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {items.map(({ card, columnTitle, dl }, idx) => (
              <Box
                key={card._id}
                onClick={() => openCard(card)}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: `1px solid ${dl.color}66`,
                  bgcolor: dl.bgColor,
                  animation: `chelloFadeSlideUp 0.3s ease ${Math.min(idx, 8) * 0.04}s both`,
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'translateX(3px)' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                  <Chip label={card.crCode || 'CR'} size="small" sx={{ height: 20, fontFamily: 'monospace', fontWeight: 800, fontSize: '0.7rem' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: dl.color }} noWrap>{dl.label}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{card.title}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  Handle by: {card.assignee || tPrimary('filterUnassigned')} • {columnTitle}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Popover>
  )
}

export default DeadlineCenterPopover
