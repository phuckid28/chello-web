import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'
import { createWorkspace } from '~/redux/workspaces/workspacesSlice'
import {
  validateWorkspaceName,
  validateWorkspaceDescription,
  isHexColor
} from '~/components/Workspace/workspaceValidation'
import { useTranslation } from '~/customHooks/useTranslation'

const ICON_PRESETS = ['🏢', '🚀', '⚡', '🛠️', '📦', '🎯', '🌟', '🔬']
const COLOR_PRESETS = ['#38bdf8', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

function WorkspaceFormDialog({ open, onClose, parentWorkspace = null, onCreated }) {
  const dispatch = useDispatch()
  const { tPrimary, formatMessage } = useTranslation()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🏢')
  const [color, setColor] = useState('#38bdf8')
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setIcon(parentWorkspace ? '🚀' : '🏢')
      setColor('#38bdf8')
      setSubmitting(false)
      setTouched(false)
    }
  }, [open, parentWorkspace])

  const nameErrorKey = validateWorkspaceName(name)
  const descErrorKey = validateWorkspaceDescription(description)
  const colorValid = isHexColor(color)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (nameErrorKey || descErrorKey || !colorValid || submitting) return

    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim() || '🏢',
        color,
        ...(parentWorkspace?._id ? { parentId: parentWorkspace._id } : {})
      }
      const created = await dispatch(createWorkspace(payload)).unwrap()
      toast.success(tPrimary('wsCreated'))
      if (onCreated) onCreated(created)
      onClose()
    } catch (err) {
      // API interceptor handles error toast
    } finally {
      setSubmitting(false)
    }
  }

  const dialogTitle = parentWorkspace
    ? formatMessage('wsFormCreateChildTitle', { parent: parentWorkspace.name })
    : tPrimary('wsFormCreateTitle')

  return (
    <Dialog open={Boolean(open)} onClose={onClose} maxWidth='sm' fullWidth>
      <Box component='form' onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 800 }}>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25}>
            <TextField
              label={tPrimary('wsFieldName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              error={Boolean(touched && nameErrorKey)}
              helperText={touched && nameErrorKey ? tPrimary(nameErrorKey) : tPrimary('wsNameRule')}
              required
              fullWidth
              autoFocus
              size='small'
            />

            <TextField
              label={tPrimary('wsFieldDescription')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={Boolean(descErrorKey)}
              helperText={tPrimary('wsDescriptionRule')}
              multiline
              minRows={2}
              fullWidth
              size='small'
            />

            <Box>
              <Typography variant='caption' sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                {tPrimary('wsFieldIcon')}
              </Typography>
              <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                {ICON_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type='button'
                    variant={icon === preset ? 'contained' : 'outlined'}
                    size='small'
                    onClick={() => setIcon(preset)}
                    sx={{ minWidth: 38, px: 1 }}
                  >
                    {preset}
                  </Button>
                ))}
                <TextField
                  size='small'
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  inputProps={{ maxLength: 4 }}
                  sx={{ width: 72 }}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant='caption' sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                {tPrimary('wsFieldColor')}
              </Typography>
              <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                {COLOR_PRESETS.map((preset) => (
                  <Box
                    key={preset}
                    onClick={() => setColor(preset)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: preset,
                      cursor: 'pointer',
                      border: color.toLowerCase() === preset.toLowerCase()
                        ? '3px solid #ffffff'
                        : '1px solid rgba(148,163,184,0.4)',
                      boxShadow: color.toLowerCase() === preset.toLowerCase()
                        ? `0 0 0 2px ${preset}`
                        : 'none'
                    }}
                  />
                ))}
                <TextField
                  size='small'
                  label={tPrimary('wsCustomHex')}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  error={Boolean(touched && !colorValid)}
                  helperText={touched && !colorValid ? tPrimary('wsHexRule') : ''}
                  sx={{ width: 130 }}
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            {tPrimary('v7Cancel')}
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={submitting || Boolean(nameErrorKey) || Boolean(descErrorKey) || !colorValid}
          >
            {submitting ? tPrimary('v7Saving') : tPrimary('v7Create')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default WorkspaceFormDialog
