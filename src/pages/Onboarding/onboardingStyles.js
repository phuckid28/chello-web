// Shared sx builders for the onboarding wizard (kept out of component files for react-refresh)

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** Selectable option card (theme / language / swatch). Motion is dropped under reduced motion. */
export const optionCardSx = (selected, accent) => ({
  position: 'relative',
  width: '100%',
  textAlign: 'left',
  borderRadius: '12px',
  border: (theme) => (selected ? `2px solid ${accent}` : `1px solid ${theme.palette.divider}`),
  boxShadow: selected ? `0 6px 18px ${accent}33` : 'none',
  transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.18s ease, box-shadow 0.18s ease',
  '&:hover': { transform: 'translateY(-2px)', borderColor: accent },
  '&.Mui-focusVisible': { outline: `2px solid ${accent}`, outlineOffset: 2 },
  [REDUCED_MOTION]: { transition: 'none', '&:hover': { transform: 'none' } }
})

export const optionGridSx = (minWidth) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
  gap: 1.25
})
