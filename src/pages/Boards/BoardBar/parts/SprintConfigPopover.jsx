import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { updateBoardDetailsAPI } from '~/apis'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useTranslation } from '~/customHooks/useTranslation'
import { playUiChime } from '~/utils/soundEffects'
import {
  DEFAULT_SPRINT_CONFIG,
  exportSprintCrsToCsv,
  formatDateVN,
  getSavedTeamRoster,
  saveTeamRosterLocal
} from '~/utils/excelExporter'

const MAX_GOAL_LENGTH = 300

const toFormState = (board) => {
  const cfg = { ...DEFAULT_SPRINT_CONFIG, ...(board?.sprintConfig || {}) }
  return {
    sprintNumber: cfg.sprintNumber || String(cfg.name || '').replace(/[^0-9]/g, '') || DEFAULT_SPRINT_CONFIG.sprintNumber,
    startDate: cfg.startDate,
    endDate: cfg.endDate,
    updateTill: cfg.updateTill || formatDateVN(new Date()),
    updatedBy: cfg.updatedBy || DEFAULT_SPRINT_CONFIG.updatedBy,
    goal: cfg.goal || ''
  }
}

const buildSprintConfigPayload = (form, teamRoster) => {
  const rawNumber = form.sprintNumber.trim() || DEFAULT_SPRINT_CONFIG.sprintNumber
  const digits = rawNumber.replace(/[^0-9]/g, '') || DEFAULT_SPRINT_CONFIG.sprintNumber
  return {
    name: rawNumber.toLowerCase().startsWith('sprint') ? rawNumber : `Sprint ${rawNumber}`,
    sprintNumber: digits,
    startDate: form.startDate.trim() || DEFAULT_SPRINT_CONFIG.startDate,
    endDate: form.endDate.trim() || DEFAULT_SPRINT_CONFIG.endDate,
    updateTill: form.updateTill.trim() || formatDateVN(new Date()),
    updatedBy: form.updatedBy.trim() || DEFAULT_SPRINT_CONFIG.updatedBy,
    goal: form.goal.trim().slice(0, MAX_GOAL_LENGTH),
    teamRoster
  }
}

// Sprint meta (Excel template top block) + unregistered team roster, persisted to the board API
function SprintConfigPopover({ anchorEl, onClose, board }) {
  const dispatch = useDispatch()
  const { tPrimary } = useTranslation()
  const [form, setForm] = useState(() => toFormState(board))
  const [teamRoster, setTeamRoster] = useState(() => getSavedTeamRoster(board))
  const [newMemberName, setNewMemberName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!anchorEl) return
    setForm(toFormState(board))
    setTeamRoster(getSavedTeamRoster(board))
  }, [anchorEl, board])

  const setField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleAddMember = () => {
    const clean = newMemberName.trim()
    if (clean && !teamRoster.includes(clean)) setTeamRoster(prev => [...prev, clean])
    setNewMemberName('')
  }

  const handleSave = async () => {
    const nextConfig = buildSprintConfigPayload(form, teamRoster)
    setSaving(true)
    try {
      await updateBoardDetailsAPI(board._id, { sprintConfig: nextConfig })
      saveTeamRosterLocal(teamRoster)
      dispatch(updateCurrentActiveBoard({ ...board, sprintConfig: nextConfig }))
      playUiChime('complete')
      toast.success(`${nextConfig.name} (${nextConfig.startDate} – ${nextConfig.endDate}) ✓`)
      onClose()
    } catch (error) {
      // authorizeAxios already surfaces API errors as toasts; keep the popover open so input isn't lost
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Box sx={{ p: 2.5, width: 440, maxWidth: '94vw', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>{tPrimary('configureSprint')}</Typography>
        <Typography variant="caption" color="text.secondary">{tPrimary('sprintConfigSub')}</Typography>

        <Stack direction="row" spacing={1.5}>
          <TextField label={tPrimary('sprintNumberLabel')} size="small" fullWidth value={form.sprintNumber} onChange={setField('sprintNumber')} placeholder="34" />
          <TextField label={tPrimary('updatedByLabel')} size="small" fullWidth value={form.updatedBy} onChange={setField('updatedBy')} />
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <TextField label={tPrimary('startDateLabel')} size="small" fullWidth value={form.startDate} onChange={setField('startDate')} placeholder="DD/MM/YYYY" />
          <TextField label={tPrimary('endDateLabel')} size="small" fullWidth value={form.endDate} onChange={setField('endDate')} placeholder="DD/MM/YYYY" />
        </Stack>
        <TextField label={tPrimary('updateTillLabel')} size="small" fullWidth value={form.updateTill} onChange={setField('updateTill')} placeholder="DD/MM/YYYY" />
        <TextField
          label={tPrimary('sprintNoteLabel')}
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={form.goal}
          onChange={setField('goal')}
          helperText={`${form.goal.length}/${MAX_GOAL_LENGTH}`}
          inputProps={{ maxLength: MAX_GOAL_LENGTH }}
        />

        <Divider />
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {tPrimary('teamRosterLabel')} ({teamRoster.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
          {teamRoster.map(member => (
            <Chip key={member} label={member} size="small" onDelete={() => setTeamRoster(prev => prev.filter(n => n !== member))} sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
          ))}
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder={tPrimary('addMemberPlaceholder')}
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              handleAddMember()
            }}
          />
          <Button size="small" variant="outlined" onClick={handleAddMember} sx={{ fontWeight: 700, flexShrink: 0 }}>{tPrimary('addBtn')}</Button>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ pt: 1 }}>
          <Button size="small" variant="outlined" color="success" onClick={() => exportSprintCrsToCsv(board)} sx={{ fontWeight: 700 }}>
            {tPrimary('exportCsvBtn')}
          </Button>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={onClose}>{tPrimary('cancelBtn')}</Button>
            <Button size="small" variant="contained" disabled={saving} onClick={handleSave} sx={{ fontWeight: 700 }}>
              {tPrimary('saveSprintBtn')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Popover>
  )
}

export default SprintConfigPopover
