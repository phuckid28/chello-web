import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { DEFAULT_FORCES, FORCE_LIMITS, TOGGLEABLE_TYPES, TYPE_COLORS } from './graphConstants'
import { PanelSection, SliderRow, SwitchRow } from './GraphPanelParts'
import GraphGroupsSection from './GraphGroupsSection'
import { glassSx, TEXT_MUTED } from './graphUiStyles'

const TYPE_LABEL_KEYS = {
  topic: 'kgTypeTopic',
  cr: 'kgTypeCr',
  member: 'kgTypeMember',
  frd: 'kgTypeFrd',
  wiki: 'kgTypeWiki',
  tag: 'kgTypeTag'
}

const DISPLAY_TOGGLES = [
  ['labels', 'kgShowLabels'],
  ['arrows', 'kgShowArrows'],
  ['hulls', 'kgHulls'],
  ['orphans', 'kgOrphans'],
  ['glow', 'kgGlow'],
  ['minimap', 'kgMinimap']
]

function CountChip({ value }) {
  return <Chip size="small" label={value} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(148,163,184,0.18)', color: TEXT_MUTED }} />
}

// Obsidian-style settings: Filters / Groups / Display / Forces
function GraphFiltersPanel({
  t, accent, filters, onFiltersChange, display, onDisplayChange,
  forces, onForcesChange, colors, onColorsChange, counts, embedded = false
}) {
  return (
    <Box sx={{ ...(embedded ? {} : glassSx), height: '100%', overflowY: 'auto', p: 1.25 }}>
      <PanelSection title={t('kgSectionFilters')}>
        {TOGGLEABLE_TYPES.map(type => (
          <SwitchRow
            key={type}
            label={t(TYPE_LABEL_KEYS[type])}
            color={TYPE_COLORS[type] || accent}
            checked={filters[type] !== false}
            trailing={<CountChip value={counts[type] || 0} />}
            onChange={(checked) => onFiltersChange({ ...filters, [type]: checked })}
          />
        ))}
      </PanelSection>

      <GraphGroupsSection t={t} accent={accent} colors={colors} onColorsChange={onColorsChange} />

      <PanelSection title={t('kgSectionDisplay')}>
        {DISPLAY_TOGGLES.map(([key, labelKey]) => (
          <SwitchRow
            key={key}
            label={t(labelKey)}
            checked={Boolean(display[key])}
            onChange={(checked) => onDisplayChange({ ...display, [key]: checked })}
          />
        ))}
        <Typography variant="caption" sx={{ display: 'block', mt: 1, mb: 0.5, color: TEXT_MUTED, fontWeight: 600 }}>
          {t('kgNodeSizeBy')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={display.sizeBy}
          onChange={(_, value) => value && onDisplayChange({ ...display, sizeBy: value })}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.72rem', py: 0.3, color: TEXT_MUTED } }}
        >
          <ToggleButton value="degree">{t('kgSizeDegree')}</ToggleButton>
          <ToggleButton value="progress">{t('kgSizeProgress')}</ToggleButton>
        </ToggleButtonGroup>
      </PanelSection>

      <PanelSection
        title={t('kgSectionForces')}
        action={(
          <Button size="small" onClick={() => onForcesChange({ ...DEFAULT_FORCES })} sx={{ textTransform: 'none', fontSize: '0.68rem', minWidth: 0, py: 0 }}>
            {t('kgResetForces')}
          </Button>
        )}
      >
        <SliderRow label={t('kgForceRepel')} value={forces.repel} limits={FORCE_LIMITS.repel} onChange={(v) => onForcesChange({ ...forces, repel: v })} />
        <SliderRow label={t('kgForceLink')} value={forces.linkDistance} limits={FORCE_LIMITS.linkDistance} onChange={(v) => onForcesChange({ ...forces, linkDistance: v })} />
        <SliderRow label={t('kgForceCenter')} value={forces.centerStrength} limits={FORCE_LIMITS.centerStrength} onChange={(v) => onForcesChange({ ...forces, centerStrength: v })} />
      </PanelSection>
    </Box>
  )
}

export default GraphFiltersPanel
