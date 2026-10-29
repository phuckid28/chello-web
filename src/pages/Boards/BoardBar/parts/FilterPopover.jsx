import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useTranslation } from '~/customHooks/useTranslation'
import { formatMessage } from '~/utils/i18nV5'
import { BA_STATUS_OPTIONS } from '~/utils/excelExporter'
import { PRIORITY_OPTIONS } from '~/utils/crMeta'
import { EMPTY_CR_FILTERS, countActiveFilters } from '~/utils/crFilters'
import { ELEMENTAL_LABELS } from '~/utils/animeTheme'

const DEADLINE_OPTIONS = [
  { value: 'all', key: 'deadlineAll' },
  { value: 'overdue', key: 'deadlineOverdue' },
  { value: 'due-soon', key: 'deadlineDueSoon' },
  { value: 'at-risk', key: 'deadlineAtRisk' },
  { value: 'none', key: 'deadlineNone' }
]

const toggleIn = (list, value) => (list.includes(value) ? list.filter(v => v !== value) : [...list, value])

function Section({ title, children }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.75, letterSpacing: 0.3 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>{children}</Box>
    </Box>
  )
}

function FilterChip({ selected, color, label, onClick }) {
  return (
    <Chip
      size="small"
      label={label}
      onClick={onClick}
      variant={selected ? 'filled' : 'outlined'}
      sx={{
        fontWeight: 700,
        fontSize: '0.72rem',
        maxWidth: 200,
        borderColor: color || undefined,
        bgcolor: selected ? (color || 'primary.main') : 'transparent',
        color: selected ? 'white' : 'text.primary',
        transition: 'all 0.18s ease',
        '&:hover': { transform: 'translateY(-1px)' }
      }}
    />
  )
}

// Jira-style quick filter panel: text, Handle by, Status, Priority, Due date bucket, Labels
function FilterPopover({ anchorEl, onClose, filters, onChange, roster = [], stats }) {
  const { tPrimary } = useTranslation()
  const update = (patch) => onChange({ ...filters, ...patch })
  const activeCount = countActiveFilters(filters)

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box sx={{ p: 2, width: 420, maxWidth: '94vw', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{tPrimary('filterPopoverTitle')}</Typography>
        <TextField
          size="small"
          fullWidth
          autoFocus
          placeholder={tPrimary('filterPlaceholder')}
          value={filters.text}
          onChange={(e) => update({ text: e.target.value })}
        />

        <Section title={tPrimary('filterHandleBy')}>
          {roster.map(name => (
            <FilterChip key={name} label={name} selected={filters.assignees.includes(name)} onClick={() => update({ assignees: toggleIn(filters.assignees, name) })} />
          ))}
          <FilterChip
            label={tPrimary('filterUnassigned')}
            selected={filters.assignees.includes('__unassigned__')}
            onClick={() => update({ assignees: toggleIn(filters.assignees, '__unassigned__') })}
          />
        </Section>

        <Section title={tPrimary('filterStatus')}>
          {BA_STATUS_OPTIONS.map(opt => (
            <FilterChip key={opt.value} label={opt.label} color={opt.color} selected={filters.statuses.includes(opt.value)} onClick={() => update({ statuses: toggleIn(filters.statuses, opt.value) })} />
          ))}
        </Section>

        <Section title={tPrimary('filterPriority')}>
          {PRIORITY_OPTIONS.map(opt => (
            <FilterChip key={opt.value} label={`${opt.icon} ${opt.label}`} color={opt.color} selected={filters.priorities.includes(opt.value)} onClick={() => update({ priorities: toggleIn(filters.priorities, opt.value) })} />
          ))}
        </Section>

        <Section title={tPrimary('filterDeadline')}>
          {DEADLINE_OPTIONS.map(opt => (
            <FilterChip key={opt.value} label={tPrimary(opt.key)} selected={filters.deadline === opt.value} onClick={() => update({ deadline: opt.value })} />
          ))}
        </Section>

        <Section title="Labels">
          {ELEMENTAL_LABELS.map(lbl => (
            <FilterChip key={lbl.id} label={lbl.title} color={lbl.color} selected={filters.text === lbl.id} onClick={() => update({ text: filters.text === lbl.id ? '' : lbl.id })} />
          ))}
        </Section>

        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {formatMessage(tPrimary('filterResultCount'), stats)}
          </Typography>
          <Button size="small" disabled={activeCount === 0} onClick={() => onChange({ ...EMPTY_CR_FILTERS })}>
            {tPrimary('clearFilter')}
          </Button>
        </Box>
      </Box>
    </Popover>
  )
}

export default FilterPopover
