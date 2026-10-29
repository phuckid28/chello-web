import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { BA_STATUS_OPTIONS } from '~/utils/excelExporter'
import { SPRINT_FALLBACK_COLOR, TYPE_COLORS } from './graphConstants'
import { PanelSection } from './GraphPanelParts'
import { TEXT_PRIMARY } from './graphUiStyles'

const HEX6 = /^#[0-9a-f]{6}$/i

const buildGroups = (t, accent) => [
  { key: 'sprint', label: t('kgTypeSprint'), color: accent || SPRINT_FALLBACK_COLOR },
  { key: 'topic', label: t('kgTypeTopic'), color: TYPE_COLORS.topic },
  ...BA_STATUS_OPTIONS.map(o => ({ key: `status:${o.value}`, label: `CR • ${o.value}`, color: o.color })),
  { key: 'member', label: t('kgTypeMember'), color: TYPE_COLORS.member },
  { key: 'frd', label: t('kgTypeFrd'), color: TYPE_COLORS.frd },
  { key: 'wiki', label: t('kgTypeWiki'), color: TYPE_COLORS.wiki },
  { key: 'tag', label: t('kgTypeTag'), color: TYPE_COLORS.tag }
]

// Native colour input styled as a round swatch; always receives a #rrggbb value
function ColorSwatch({ value, label, onChange }) {
  const safe = HEX6.test(value) ? value : SPRINT_FALLBACK_COLOR
  return (
    <Box
      component="input"
      type="color"
      aria-label={label}
      value={safe}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        width: 22,
        height: 22,
        p: 0,
        border: '2px solid rgba(148, 163, 184, 0.4)',
        borderRadius: '50%',
        bgcolor: 'transparent',
        cursor: 'pointer',
        overflow: 'hidden',
        '&::-webkit-color-swatch-wrapper': { p: 0 },
        '&::-webkit-color-swatch': { border: 'none', borderRadius: '50%' },
        '&::-moz-color-swatch': { border: 'none', borderRadius: '50%' }
      }}
    />
  )
}

// "Groups": colour per node type / CR Status. Overrides are stored as { [groupKey]: '#rrggbb' }.
function GraphGroupsSection({ t, accent, colors, onColorsChange }) {
  const groups = buildGroups(t, accent)
  const hasOverrides = Object.keys(colors).length > 0

  return (
    <PanelSection
      title={t('kgSectionGroups')}
      defaultOpen={false}
      action={hasOverrides && (
        <Button size="small" onClick={() => onColorsChange({})} sx={{ textTransform: 'none', fontSize: '0.68rem', minWidth: 0, py: 0 }}>
          {t('kgResetColors')}
        </Button>
      )}
    >
      {groups.map(group => (
        <Box key={group.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.35 }}>
          <ColorSwatch
            value={colors[group.key] || group.color}
            label={group.label}
            onChange={(value) => onColorsChange({ ...colors, [group.key]: value })}
          />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: '0.8rem' }} noWrap>{group.label}</Typography>
        </Box>
      ))}
    </PanelSection>
  )
}

export default GraphGroupsSection
