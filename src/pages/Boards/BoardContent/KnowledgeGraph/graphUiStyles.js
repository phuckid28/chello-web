// Shared MUI `sx` fragments for the graph UI (glass panels, toolbar buttons)

export const GLASS_BG = 'rgba(10, 15, 30, 0.74)'
export const GLASS_BORDER = '1px solid rgba(148, 163, 184, 0.2)'
export const TEXT_PRIMARY = '#f1f5f9'
export const TEXT_MUTED = 'rgba(203, 213, 225, 0.72)'

export const glassSx = {
  bgcolor: GLASS_BG,
  backdropFilter: 'blur(16px) saturate(140%)',
  WebkitBackdropFilter: 'blur(16px) saturate(140%)',
  border: GLASS_BORDER,
  borderRadius: '14px',
  boxShadow: '0 12px 32px rgba(2, 6, 23, 0.45)',
  color: TEXT_PRIMARY
}

export const toolbarButtonSx = (active, accent) => ({
  color: active ? '#0b1020' : TEXT_PRIMARY,
  bgcolor: active ? accent : 'transparent',
  borderRadius: '10px',
  transition: 'background-color 0.18s ease, transform 0.18s ease, color 0.18s ease',
  '&:hover': {
    bgcolor: active ? accent : 'rgba(148, 163, 184, 0.18)',
    transform: 'translateY(-1px)'
  },
  '&.Mui-disabled': { color: 'rgba(148, 163, 184, 0.4)' }
})

export const chipSx = (color, active = true) => ({
  height: 22,
  fontWeight: 700,
  fontSize: '0.68rem',
  color: active ? '#0b1020' : TEXT_MUTED,
  bgcolor: active ? color : 'rgba(148, 163, 184, 0.14)',
  borderRadius: '8px'
})

export const rowHoverSx = {
  borderRadius: '10px',
  transition: 'background-color 0.15s ease, transform 0.15s ease',
  '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.14)', transform: 'translateX(2px)' }
}
