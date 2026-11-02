// Shared sx tokens for v7 pages (kept out of component files for react-refresh)

// Raised surface matching the Settings / dashboard cards
export const surfaceSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: 'var(--chella-radius-card, 14px)',
  border: (theme) => `1px solid ${theme.palette.divider}`,
  bgcolor: (theme) => (theme.palette.mode === 'dark'
    ? 'var(--chella-raised-dark, #131c31)'
    : 'var(--chella-raised-light, #ffffff)')
}

export const MONO_FONT = '"JetBrains Mono", Consolas, monospace'
