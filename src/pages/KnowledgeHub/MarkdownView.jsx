import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { decodeWikiHref, transformWikiLinksToMarkdown } from '~/utils/wikiLinks'
import { slugifyHeading } from './wikiOutline'
import { markdownBodySx } from './markdownStyles'

const headingText = (children) => {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(headingText).join('')
  if (children?.props?.children) return headingText(children.props.children)
  return ''
}

const makeHeading = (Tag) => function Heading({ children }) {
  return <Tag id={slugifyHeading(headingText(children))}>{children}</Tag>
}


const WIKI_CHIP_STYLES = {
  card: { bg: 'rgba(56, 189, 248, 0.16)', border: '#38bdf8' },
  page: { bg: 'rgba(167, 139, 250, 0.16)', border: '#a78bfa' },
  missing: { bg: 'rgba(148, 163, 184, 0.12)', border: '#94a3b8' }
}

// Renders markdown safely (no raw HTML) and turns [[WikiLinks]] into interactive chips
function MarkdownView({ content, resolveTarget, onWikiLinkClick, missingLabel }) {
  const components = {
    h1: makeHeading('h1'),
    h2: makeHeading('h2'),
    h3: makeHeading('h3'),
    a: function WikiAwareLink({ href, children }) {
      const target = decodeWikiHref(href)
      if (!target) {
        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      }
      const resolved = resolveTarget(target)
      const style = WIKI_CHIP_STYLES[resolved.type]
      const prefix = resolved.type === 'card' ? '🎫' : (resolved.type === 'page' ? (resolved.page.icon || '📄') : '＋')
      const label = <>{prefix} {children}</>
      const chip = (
        <Box
          component="span"
          role="link"
          tabIndex={0}
          onClick={() => onWikiLinkClick(resolved)}
          onKeyDown={(e) => { if (e.key === 'Enter') onWikiLinkClick(resolved) }}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 0.75,
            mx: 0.25,
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9em',
            bgcolor: style.bg,
            border: `1px ${resolved.type === 'missing' ? 'dashed' : 'solid'} ${style.border}`,
            transition: 'transform 0.15s ease',
            '&:hover': { transform: 'translateY(-1px)' }
          }}
        >
          {label}
        </Box>
      )
      return resolved.type === 'missing' ? <Tooltip title={missingLabel}>{chip}</Tooltip> : chip
    }
  }

  return (
    <Box sx={markdownBodySx}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {transformWikiLinksToMarkdown(content || '')}
      </ReactMarkdown>
    </Box>
  )
}

export default MarkdownView
