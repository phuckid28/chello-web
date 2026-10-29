import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { toast } from 'react-toastify'
import { useTranslation } from '~/customHooks/useTranslation'
import { buildSprintReport } from '~/utils/sprintReport'
import { playUiChime } from '~/utils/soundEffects'

const downloadTextFile = (filename, text) => {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function SprintReportDialog({ open, onClose, board }) {
  const { tPrimary, lang, languages } = useTranslation()
  const [mode, setMode] = useState('status')
  const [reportLang, setReportLang] = useState(lang)

  const report = useMemo(
    () => (open ? buildSprintReport({ board, mode, lang: reportLang }) : ''),
    [open, board, mode, reportLang]
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report)
      playUiChime('complete')
      toast.success(tPrimary('copiedMsg'))
    } catch (error) {
      toast.warning(tPrimary('copyFailedMsg'))
    }
  }

  const handleDownload = () => {
    const sprintSlug = String(board?.sprintConfig?.name || 'Sprint').replace(/\s+/g, '_')
    downloadTextFile(`${sprintSlug}_${mode}_report.md`, report)
    playUiChime('complete')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>{tPrimary('sprintReportTitle')}</DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {tPrimary('sprintReportSub')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={(e, next) => next && setMode(next)}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700 } }}
          >
            <ToggleButton value="status">{tPrimary('reportModeStatus')}</ToggleButton>
            <ToggleButton value="standup">{tPrimary('reportModeStandup')}</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            select
            size="small"
            label={tPrimary('reportLanguage')}
            value={reportLang}
            onChange={(e) => setReportLang(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            {languages.map(l => (
              <MenuItem key={l.code} value={l.code}>{l.flag} {l.nativeName}</MenuItem>
            ))}
          </TextField>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={14}
          maxRows={22}
          value={report}
          InputProps={{ readOnly: true, sx: { fontFamily: '"JetBrains Mono", Consolas, monospace', fontSize: '0.8rem', lineHeight: 1.55 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{tPrimary('closeBtn')}</Button>
        <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={handleDownload}>{tPrimary('downloadMdBtn')}</Button>
        <Button variant="contained" startIcon={<ContentCopyRoundedIcon />} onClick={handleCopy}>{tPrimary('copyBtn')}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SprintReportDialog
