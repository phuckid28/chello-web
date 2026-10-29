import { useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { TEXT_MUTED, TEXT_PRIMARY } from './graphUiStyles'

const KIND_COLORS = { key: '#fbbf24', value: '#38bdf8', node: '#e879f9' }

// Search input with Obsidian-style query syntax, suggestions and a live match counter
function GraphSearchBox({ t, value, onChange, inputRef, suggestions, matchCount, totalCount, accent }) {
  const [focused, setFocused] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const open = focused && suggestions.length > 0
  const hasQuery = value.trim().length > 0

  const accept = (suggestion) => {
    onChange(suggestion.insert)
    setActiveIdx(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault()
      setActiveIdx(i => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault()
      setActiveIdx(i => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if ((e.key === 'Enter' || e.key === 'Tab') && open && activeIdx >= 0) {
      e.preventDefault()
      accept(suggestions[activeIdx])
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      e.currentTarget.querySelector('input')?.blur()
    }
  }

  return (
    <Box sx={{ position: 'relative', flex: 1, minWidth: 140, maxWidth: 460 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          height: 38,
          borderRadius: '12px',
          bgcolor: 'rgba(15, 23, 42, 0.7)',
          border: `1px solid ${focused ? accent : 'rgba(148, 163, 184, 0.22)'}`,
          boxShadow: focused ? `0 0 0 3px ${accent}33` : 'none',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease'
        }}
      >
        <SearchRoundedIcon sx={{ fontSize: 19, color: TEXT_MUTED }} />
        <InputBase
          fullWidth
          inputRef={inputRef}
          value={value}
          placeholder={t('kgSearchPlaceholder')}
          onChange={(e) => { onChange(e.target.value); setActiveIdx(-1) }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          inputProps={{ 'aria-label': t('kgSearchPlaceholder'), spellCheck: false, autoComplete: 'off' }}
          sx={{ color: TEXT_PRIMARY, fontSize: '0.84rem', '& input::placeholder': { color: TEXT_MUTED, opacity: 1 } }}
        />
        {hasQuery && (
          <>
            <Chip
              size="small"
              label={`${matchCount}/${totalCount}`}
              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: matchCount ? `${accent}33` : 'rgba(239,68,68,0.25)', color: TEXT_PRIMARY }}
            />
            <IconButton size="small" aria-label={t('kgSearchClear')} onClick={() => onChange('')} sx={{ color: TEXT_MUTED, p: 0.25 }}>
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </>
        )}
      </Box>

      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 44,
            left: 0,
            right: 0,
            zIndex: 5,
            py: 0.5,
            borderRadius: '12px',
            bgcolor: 'rgba(10, 15, 30, 0.96)',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            backdropFilter: 'blur(14px)'
          }}
        >
          {suggestions.map((s, idx) => (
            <Box
              key={`${s.kind}-${s.label}`}
              onMouseDown={(e) => { e.preventDefault(); accept(s) }}
              onMouseEnter={() => setActiveIdx(idx)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.6,
                cursor: 'pointer',
                bgcolor: idx === activeIdx ? 'rgba(148, 163, 184, 0.18)' : 'transparent'
              }}
            >
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: KIND_COLORS[s.kind] }} />
              <Typography variant="body2" noWrap sx={{ color: TEXT_PRIMARY, fontSize: '0.8rem', fontFamily: s.kind === 'node' ? 'inherit' : 'monospace' }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  )
}

export default GraphSearchBox
