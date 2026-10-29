import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { useTranslation } from '~/customHooks/useTranslation'

function CardDescriptionMdEditor({ cardDescriptionProp, handleUpdateCardDescription }) {
  const { tPrimary } = useTranslation()
  const [markdownEditMode, setMarkdownEditMode] = useState(false)
  const [cardDescription, setCardDescription] = useState(cardDescriptionProp || '')

  useEffect(() => {
    setCardDescription(cardDescriptionProp || '')
  }, [cardDescriptionProp])

  const updateCardDescription = () => {
    setMarkdownEditMode(false)
    handleUpdateCardDescription(cardDescription)
  }

  return (
    <Box sx={{ mt: -4 }}>
      {markdownEditMode
        ? <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            fullWidth
            multiline
            rows={5}
            placeholder={tPrimary('addDetailedDescPlaceholder')}
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            autoFocus
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setCardDescription(cardDescriptionProp || '')
                setMarkdownEditMode(false)
              }}
              size="small"
              variant="text"
            >
              {tPrimary('cancelBtn')}
            </Button>
            <Button
              onClick={updateCardDescription}
              className="interceptor-loading"
              type="button"
              variant="contained"
              size="small"
              color="info"
            >
              {tPrimary('saveBtn')}
            </Button>
          </Box>
        </Box>
        : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            sx={{ alignSelf: 'flex-end' }}
            onClick={() => setMarkdownEditMode(true)}
            type="button"
            variant="contained"
            color="info"
            size="small"
            startIcon={<EditNoteIcon />}
          >
            {tPrimary('editBtn')}
          </Button>
          <Box
            onClick={() => setMarkdownEditMode(true)}
            sx={{
              cursor: 'pointer',
              p: cardDescription ? '12px' : '16px',
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' ? ' rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
              borderRadius: '6px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            <Typography variant="body2" sx={{ color: cardDescription ? 'text.primary' : 'text.secondary' }}>
              {cardDescription || tPrimary('addDetailedDescPlaceholder')}
            </Typography>
          </Box>
        </Box>
      }
    </Box>
  )
}

export default CardDescriptionMdEditor
