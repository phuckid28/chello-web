// Typography for rendered Knowledge Hub markdown (headings, tables, code, task lists)
export const markdownBodySx = {
  fontSize: '0.92rem',
  lineHeight: 1.72,
  wordBreak: 'break-word',
  '& h1, & h2, & h3, & h4': {
    fontWeight: 800,
    lineHeight: 1.28,
    letterSpacing: '-0.018em',
    textWrap: 'balance',
    mt: 2.5,
    mb: 1,
    scrollMarginTop: '80px'
  },
  '& h1': { fontSize: '1.6rem' },
  '& h2': { fontSize: '1.25rem', pb: 0.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` },
  '& h3': { fontSize: '1.08rem' },
  '& p': { my: 1, maxWidth: '72ch' },
  '& a': {
    color: 'primary.main',
    fontWeight: 600,
    textUnderlineOffset: '0.2em'
  },
  '& ul, & ol': { pl: 3 },
  '& li.task-list-item': { listStyle: 'none', ml: -2.5 },
  '& blockquote': {
    m: 0,
    my: 1.5,
    px: 2,
    py: 1,
    border: (theme) => `1px solid ${theme.palette.divider}`,
    bgcolor: 'action.hover',
    borderRadius: '10px',
    color: 'text.secondary',
    fontStyle: 'italic'
  },
  '& code': {
    fontFamily: '"JetBrains Mono", Consolas, monospace',
    fontSize: '0.82em',
    px: 0.6,
    py: 0.15,
    borderRadius: '6px',
    bgcolor: 'action.selected'
  },
  '& pre': {
    p: 1.5,
    borderRadius: '10px',
    overflowX: 'auto',
    border: (theme) => `1px solid ${theme.palette.divider}`,
    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(2, 6, 23, 0.72)' : 'rgba(15, 23, 42, 0.04)')
  },
  '& pre code': { p: 0, bgcolor: 'transparent' },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    my: 1.5,
    fontSize: '0.86rem',
    fontVariantNumeric: 'tabular-nums'
  },
  '& th, & td': { border: (theme) => `1px solid ${theme.palette.divider}`, px: 1.25, py: 0.75, textAlign: 'left' },
  '& th': { bgcolor: 'action.hover', fontWeight: 800 },
  '& hr': { border: 0, borderTop: (theme) => `1px solid ${theme.palette.divider}`, my: 2 }
}
