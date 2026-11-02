import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useTranslation } from '~/customHooks/useTranslation'
import FrdVisualDocument from './FrdVisualDocument'

function CardDescriptionMdEditor({
  card,
  sprintNumber = '34',
  cardDescriptionProp,
  handleUpdateCardDescription
}) {
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
    <Box sx={{ mt: 1 }}>
      {markdownEditMode ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            fullWidth
            multiline
            minRows={8}
            maxRows={18}
            placeholder={tPrimary('addDetailedDescPlaceholder')}
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            autoFocus
            sx={{
              '& textarea': {
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                fontSize: '0.84rem',
                lineHeight: 1.6
              }
            }}
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
      ) : (
        <FrdVisualDocument
          card={card}
          markdownText={cardDescription}
          sprintNumber={sprintNumber}
          onEditClick={() => setMarkdownEditMode(true)}
          editButtonLabel={tPrimary('editBtn')}
          emptyPlaceholder={tPrimary('addDetailedDescPlaceholder')}
        />
      )}
    </Box>
  )
}

export default CardDescriptionMdEditor
