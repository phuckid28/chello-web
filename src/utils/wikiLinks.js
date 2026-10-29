// Obsidian-style [[WikiLink]] helpers shared by the Knowledge Hub, CR Studio & Graph view

const WIKI_LINK_REGEX = /\[\[([^[\]\n]+?)\]\]/g
const FENCE_REGEX = /(```[\s\S]*?```)/g

export const WIKI_HASH_PREFIX = '#wiki/'

const splitTarget = (raw) => {
  const [target, alias] = String(raw).split('|')
  return { target: target.trim(), alias: (alias || '').trim() }
}

// Splits markdown into [text, code, text, code...] so links inside fenced code blocks are ignored
const mapOutsideCodeFences = (markdown, mapper) => String(markdown || '')
  .split(FENCE_REGEX)
  .map((chunk, idx) => (idx % 2 === 1 ? chunk : mapper(chunk)))
  .join('')

export const extractWikiLinks = (markdown) => {
  const found = new Set()
  String(markdown || '').split(FENCE_REGEX).forEach((chunk, idx) => {
    if (idx % 2 === 1) return
    for (const match of chunk.matchAll(WIKI_LINK_REGEX)) {
      const { target } = splitTarget(match[1])
      if (target) found.add(target)
    }
  })
  return Array.from(found)
}

// [[BNPL-945|Usage limit]] → [Usage limit](#wiki/BNPL-945) so react-markdown can render it safely
export const transformWikiLinksToMarkdown = (markdown) => mapOutsideCodeFences(markdown, (chunk) =>
  chunk.replace(WIKI_LINK_REGEX, (_, raw) => {
    const { target, alias } = splitTarget(raw)
    if (!target) return _
    const label = (alias || target).replace(/[[\]]/g, '')
    const href = encodeURIComponent(target).replace(/\(/g, '%28').replace(/\)/g, '%29')
    return `[${label}](${WIKI_HASH_PREFIX}${href})`
  })
)

export const decodeWikiHref = (href) => {
  if (typeof href !== 'string' || !href.startsWith(WIKI_HASH_PREFIX)) return null
  try {
    return decodeURIComponent(href.slice(WIKI_HASH_PREFIX.length))
  } catch (e) {
    // Malformed escape sequence — treat as a plain (non-wiki) link
    return null
  }
}

const normalizeKey = (value) => String(value || '').trim().toLowerCase()

// Builds a resolver that maps a [[target]] to a CR card (by Ticket ID) or a wiki page (by title)
export const createWikiResolver = ({ cards = [], pages = [] }) => {
  const cardsByCode = new Map()
  cards.forEach(card => {
    if (card?.crCode) cardsByCode.set(normalizeKey(card.crCode), card)
  })
  const pagesByTitle = new Map()
  pages.forEach(page => {
    if (page?.title) pagesByTitle.set(normalizeKey(page.title), page)
  })

  return (target) => {
    const key = normalizeKey(target)
    if (cardsByCode.has(key)) return { type: 'card', card: cardsByCode.get(key) }
    if (pagesByTitle.has(key)) return { type: 'page', page: pagesByTitle.get(key) }
    return { type: 'missing', target }
  }
}

// Every page / card whose content links to one of the given keys (case-insensitive)
export const computeBacklinks = ({ keys = [], pages = [], cards = [], excludePageId = null }) => {
  const wanted = new Set(keys.filter(Boolean).map(normalizeKey))
  if (!wanted.size) return { pages: [], cards: [] }
  const linksTo = (text) => extractWikiLinks(text).some(t => wanted.has(normalizeKey(t)))

  return {
    pages: pages.filter(p => p._id !== excludePageId && linksTo(p.content)),
    cards: cards.filter(c => linksTo(c.description) || linksTo(c.note))
  }
}
