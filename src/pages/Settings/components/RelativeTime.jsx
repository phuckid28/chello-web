import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import { useTranslation } from '~/customHooks/useTranslation'
import { formatDateTime, formatRelativeTime } from '../utils/format'

// Relative time ("3 minutes ago") with the absolute timestamp in a tooltip and <time> element
function RelativeTime({ value, sx }) {
  const { lang } = useTranslation()
  if (!value) return null
  const absolute = formatDateTime(value, lang)
  return (
    <Tooltip title={absolute}>
      <Box component="time" dateTime={new Date(Number(value)).toISOString()} sx={sx}>
        {formatRelativeTime(value, lang)}
      </Box>
    </Tooltip>
  )
}

export default RelativeTime
