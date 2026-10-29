import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { buildPageTree } from './wikiOutline'

const INDENT_PX = 14

function TreeNode({ node, depth, selectedId, onSelect, onAddChild, addChildLabel, expanded, toggle }) {
  const { page, children } = node
  const isOpen = expanded[page._id] !== false
  const active = page._id === selectedId

  return (
    <Box>
      <Box
        onClick={() => onSelect(page._id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          pl: `${8 + depth * INDENT_PX}px`,
          pr: 0.5,
          py: 0.5,
          borderRadius: '8px',
          cursor: 'pointer',
          bgcolor: active ? 'action.selected' : 'transparent',
          fontWeight: active ? 800 : 600,
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover' },
          '&:hover .tree-add': { opacity: 1 }
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            toggle(page._id)
          }}
          sx={{ p: 0.15, visibility: children.length ? 'visible' : 'hidden' }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: 16, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </IconButton>
        <Box component="span" sx={{ fontSize: 15, flexShrink: 0 }}>{page.icon || '📄'}</Box>
        <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 'inherit' }}>{page.title}</Typography>
        <Tooltip title={addChildLabel}>
          <IconButton
            className="tree-add"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onAddChild(page._id)
            }}
            sx={{ p: 0.2, opacity: 0, transition: 'opacity 0.15s ease' }}
          >
            <AddRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
      {isOpen && children.map(child => (
        <TreeNode
          key={child.page._id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          onAddChild={onAddChild}
          addChildLabel={addChildLabel}
          expanded={expanded}
          toggle={toggle}
        />
      ))}
    </Box>
  )
}

// Confluence-like page tree with instant search across titles, tags and content
function PageTree({ pages, selectedId, onSelect, onCreate, labels }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState({})
  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: prev[id] === false }))

  const tree = useMemo(() => buildPageTree(pages), [pages])
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return pages.filter(p => [p.title, p.content, ...(p.tags || [])].some(v => String(v || '').toLowerCase().includes(q)))
  }, [pages, query])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', minHeight: 0 }}>
      <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => onCreate(null)} sx={{ fontWeight: 800 }}>
        {labels.newPage}
      </Button>
      <TextField
        size="small"
        placeholder={labels.searchPages}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
      />
      <Box sx={{ flex: 1, overflowY: 'auto', mx: -0.5, px: 0.5 }}>
        {searchResults
          ? searchResults.map(page => (
            <TreeNode
              key={page._id}
              node={{ page, children: [] }}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onCreate}
              addChildLabel={labels.newSubPage}
              expanded={expanded}
              toggle={toggle}
            />
          ))
          : tree.map(node => (
            <TreeNode
              key={node.page._id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onCreate}
              addChildLabel={labels.newSubPage}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
      </Box>
    </Box>
  )
}

export default PageTree
