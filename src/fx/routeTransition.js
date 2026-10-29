// Route → transition mapping (pure). Keys stay stable while navigating inside the same screen
// so editors (e.g. Knowledge Hub pages) are not remounted on every page switch.

const WIKI_SEGMENT = /^\/boards\/([^/]+)\/wiki(?:\/|$)/
const CR_SEGMENT = /^\/boards\/([^/]+)\/cr\/([^/]+)/
const BOARD_SEGMENT = /^\/boards\/([^/]+)\/?$/

export const getRouteTone = (pathname = '') => {
  if (CR_SEGMENT.test(pathname)) return 'cr'
  if (WIKI_SEGMENT.test(pathname)) return 'wiki'
  if (BOARD_SEGMENT.test(pathname)) return 'board'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'list'
}

export const getTransitionKey = (pathname = '') => {
  const wiki = pathname.match(WIKI_SEGMENT)
  if (wiki) return `wiki:${wiki[1]}`
  const cr = pathname.match(CR_SEGMENT)
  if (cr) return `cr:${cr[1]}:${cr[2]}`
  if (pathname.startsWith('/settings')) return 'settings'
  return pathname || '/'
}
