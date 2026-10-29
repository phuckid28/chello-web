import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LocalGraphMini from '~/pages/Boards/BoardContent/KnowledgeGraph/LocalGraphMini'

function PanelSection({ title, count, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
        <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.4, color: 'text.secondary', textTransform: 'uppercase' }}>{title}</Typography>
        {count !== undefined && <Chip size="small" label={count} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
      </Box>
      {children}
    </Box>
  )
}

function LinkRow({ icon, label, sub, onClick, dashed }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.6,
        mb: 0.5,
        borderRadius: '8px',
        cursor: 'pointer',
        border: (theme) => `1px ${dashed ? 'dashed' : 'solid'} ${theme.palette.divider}`,
        transition: 'transform 0.15s ease, background-color 0.15s ease',
        '&:hover': { bgcolor: 'action.hover', transform: 'translateX(2px)' }
      }}
    >
      <Box component="span" sx={{ flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{label}</Typography>
        {sub && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{sub}</Typography>}
      </Box>
    </Box>
  )
}

// Right-hand panel: outline, outgoing links and backlinks (Obsidian-style)
function LinksPanel({ outline, outgoing, backlinks, onOpenTarget, onOpenPage, onOpenCard, labels }) {
  const backlinkCount = backlinks.pages.length + backlinks.cards.length

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {outline.length > 0 && (
        <PanelSection title={labels.pageOutline}>
          {outline.map((h, idx) => (
            <Typography
              key={`${h.id}-${idx}`}
              variant="body2"
              onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              sx={{ pl: (h.level - 1) * 1.5, py: 0.25, cursor: 'pointer', color: 'text.secondary', fontWeight: h.level === 1 ? 800 : 600, '&:hover': { color: 'primary.main' } }}
              noWrap
            >
              {h.text}
            </Typography>
          ))}
        </PanelSection>
      )}

      <Divider />
      <PanelSection title={labels.outgoingLinks} count={outgoing.length}>
        {outgoing.length === 0 && <Typography variant="caption" color="text.secondary">{labels.noOutgoingLinks}</Typography>}
        {outgoing.map(link => {
          if (link.type === 'card') {
            return <LinkRow key={`c-${link.card._id}`} icon="🎫" label={`${link.card.crCode} • ${link.card.title}`} sub={link.card.baStatus} onClick={() => onOpenTarget(link)} />
          }
          if (link.type === 'page') {
            return <LinkRow key={`p-${link.page._id}`} icon={link.page.icon || '📄'} label={link.page.title} onClick={() => onOpenTarget(link)} />
          }
          return <LinkRow key={`m-${link.target}`} icon="＋" label={link.target} sub={labels.missingLink} dashed onClick={() => onOpenTarget(link)} />
        })}
      </PanelSection>

      <Divider />
      <PanelSection title={labels.backlinks} count={backlinkCount}>
        {backlinkCount === 0 && <Typography variant="caption" color="text.secondary">{labels.noBacklinks}</Typography>}
        {backlinks.pages.map(p => (
          <LinkRow key={`bp-${p._id}`} icon={p.icon || '📄'} label={p.title} onClick={() => onOpenPage(p._id)} />
        ))}
        {backlinks.cards.map(c => (
          <LinkRow key={`bc-${c._id}`} icon="🎫" label={`${c.crCode || 'CR'} • ${c.title}`} sub={c.baStatus} onClick={() => onOpenCard(c)} />
        ))}
      </PanelSection>

      <Divider />
      <LocalGraphMini centerType="wiki" onOpenPage={onOpenPage} onOpenCard={onOpenCard} />
    </Box>
  )
}

export default LinksPanel
