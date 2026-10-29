import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { PROGRESS_OPTIONS, getProgressColor, progressToPercent, snapProgress } from '~/utils/progress'

// 0% → 100% picker in 10% steps. `value` / `onChange` use a fraction (0 → 1).
function ProgressSelect({ value, onChange, label = 'Dev Progress', size = 'small', fullWidth = true, disabled = false }) {
  const percent = progressToPercent(value)

  return (
    <TextField
      select
      label={label}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      value={percent}
      onChange={(e) => onChange?.(snapProgress(Number(e.target.value)))}
      SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 340, borderRadius: '12px' } } } }}
    >
      {PROGRESS_OPTIONS.map(opt => (
        <MenuItem key={opt.percent} value={opt.percent} sx={{ gap: 1.5, minWidth: 190 }}>
          <Typography variant="body2" sx={{ width: 42, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {opt.label}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={opt.percent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: getProgressColor(opt.value), borderRadius: 3 }
              }}
            />
          </Box>
        </MenuItem>
      ))}
    </TextField>
  )
}

export default ProgressSelect
