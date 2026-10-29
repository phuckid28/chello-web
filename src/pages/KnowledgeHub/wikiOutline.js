// Heading outline helpers for Knowledge Hub pages

export const slugifyHeading = (text) => String(text || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff\uac00-\ud7af]+/g, '-')
  .replace(/^-+|-+$/g, '')

// Returns [{ level, text, id }] for markdown headings (#..###), skipping fenced code blocks
export const extractOutline = (markdown) => {
  const outline = []
  let inFence = false
  String(markdown || '').split('\n').forEach(line => {
    if (line.trim().startsWith('```')) {
      inFence = !inFence
      return
    }
    if (inFence) return
    const match = line.match(/^(#{1,3})\s+(.+?)\s*#*$/)
    if (match) {
      const text = match[2].replace(/[*_`]/g, '').trim()
      outline.push({ level: match[1].length, text, id: slugifyHeading(text) })
    }
  })
  return outline
}

// Builds a nested tree [{ page, children: [...] }] from a flat list using parentId
export const buildPageTree = (pages = []) => {
  const byId = new Map(pages.map(p => [p._id, { page: p, children: [] }]))
  const roots = []
  byId.forEach(node => {
    const parent = node.page.parentId ? byId.get(node.page.parentId) : null
    if (parent && parent !== node) parent.children.push(node)
    else roots.push(node)
  })
  return roots
}
