// Typography for rendered Knowledge Hub markdown (headings, tables, code, task lists)
export const markdownBodySx = {
  fontSize: '0.92rem',
  lineHeight: 1.75,
  wordBreak: 'break-word',
  '& h1, & h2, & h3, & h4': { fontWeight: 800, lineHeight: 1.3, mt: 2.5, mb: 1, scrollMarginTop: '80px' },
  '& h1': { fontSize: '1.6rem' },
  '& h2': { fontSize: '1.25rem', pb: 0.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` },
  '& h3': { fontSize: '1.08rem' },
  '& p': { my: 1 },
  '& a': { color: 'primary.main', fontWeight: 600 },
  '& ul, & ol': { pl: 3 },
  '& li.task-list-item': { listStyle: 'none', ml: -2.5 },
  '& blockquote': { m: 0, my: 1.5, px: 2, py: 0.5, borderLeft: '4px solid', borderColor: 'secondary.main', bgcolor: 'action.hover', borderRadius: '0 8px 8px 0' },
  '& code': { fontFamily: '"JetBrains Mono", Consolas, monospace', fontSize: '0.82em', px: 0.6, py: 0.15, borderRadius: '6px', bgcolor: 'action.selected' },
  '& pre': { p: 1.5, borderRadius: '10px', overflowX: 'auto', bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(2, 6, 23, 0.7)' : 'rgba(15, 23, 42, 0.05)') },
  '& pre code': { p: 0, bgcolor: 'transparent' },
  '& table': { borderCollapse: 'collapse', width: '100%', my: 1.5, fontSize: '0.86rem' },
  '& th, & td': { border: (theme) => `1px solid ${theme.palette.divider}`, px: 1.25, py: 0.75, textAlign: 'left' },
  '& th': { bgcolor: 'action.hover', fontWeight: 800 },
  '& hr': { border: 0, borderTop: (theme) => `1px solid ${theme.palette.divider}`, my: 2 }
}
