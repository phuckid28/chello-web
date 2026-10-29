// Themed mouse cursors: every theme gets an arrow + a "pointer" variant drawn as inline SVG.
// The hotspot is the arrow tip at (4, 3). Images stay at 32x32 for broad browser support.

const ARROW_PATH = 'M4 3 L4 23 L9.2 18.4 L12.6 26 L16 24.5 L12.7 17 L19.8 17 Z'
const HOTSPOT = { x: 4, y: 3 }

// Small charm drawn at the lower-right of the arrow, unique per theme
const CHARMS = {
  cosmos: (c) => `<path d="M24 17.5 L25.7 22.3 L30.5 24 L25.7 25.7 L24 30.5 L22.3 25.7 L17.5 24 L22.3 22.3 Z" fill="${c.charm}" stroke="#0f172a" stroke-width="0.9" stroke-linejoin="round"/>`,
  'wind-chime': (c) => `<path d="M19.5 29.5 C19.5 22.5 25 19 30 19 C30 25 26 29.5 19.5 29.5 Z" fill="${c.charm}" stroke="#0f172a" stroke-width="0.9" stroke-linejoin="round"/><path d="M21 28 L27.5 21.5" stroke="#0f172a" stroke-width="0.8" stroke-linecap="round"/>`,
  'sora-sky': (c) => `<g fill="${c.charm}" stroke="#0f172a" stroke-width="0.9"><circle cx="21.5" cy="26" r="3.2"/><circle cx="25.8" cy="24" r="4.2"/><circle cx="29.2" cy="26.8" r="2.6"/><rect x="21.5" y="26" width="8" height="3.2" stroke="none"/></g>`,
  'sora-twilight': (c) => `<path d="M26.5 17.5 A6.4 6.4 0 1 0 30.3 27.4 A5.2 5.2 0 1 1 26.5 17.5 Z" fill="${c.charm}" stroke="#0f172a" stroke-width="0.9" stroke-linejoin="round"/>`,
  'sora-usagi': (c) => `<g fill="${c.charm}" stroke="#0f172a" stroke-width="0.9"><ellipse cx="22.3" cy="20.8" rx="1.6" ry="3.6"/><ellipse cx="26.7" cy="20.8" rx="1.6" ry="3.6"/><circle cx="24.5" cy="27" r="4.3"/></g><circle cx="23.2" cy="26.6" r="0.7" fill="#0f172a"/><circle cx="25.8" cy="26.6" r="0.7" fill="#0f172a"/>`,
  furina: (c) => `<path d="M24.5 17.5 C24.5 17.5 30.5 23.5 30.5 27 A6 6 0 0 1 18.5 27 C18.5 23.5 24.5 17.5 24.5 17.5 Z" fill="${c.charm}" stroke="#0f172a" stroke-width="0.9" stroke-linejoin="round"/><path d="M22 27.5 A2.6 2.6 0 0 0 24.6 30" stroke="#ffffff" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.85"/>`,
  nahida: (c) => `<g fill="${c.charm}" stroke="#0f172a" stroke-width="0.9" stroke-linejoin="round"><path d="M24 30.5 L24 24" fill="none" stroke-linecap="round"/><path d="M24 25.5 C19 25.5 17.5 21.5 17.5 21.5 C22 20.5 24 22.5 24 25.5 Z"/><path d="M24 24.5 C24 20 27 17.5 30.5 17.5 C30.5 22 27.5 24.5 24 24.5 Z"/></g>`
}

const DEFAULT_THEME = 'sora-sky'

const buildSvg = (themeKey, { accent, secondary }, variant) => {
  const isPointer = variant === 'pointer'
  const charm = CHARMS[themeKey] || CHARMS[DEFAULT_THEME]
  const halo = isPointer
    ? `<circle cx="${HOTSPOT.x}" cy="${HOTSPOT.y}" r="2.6" fill="${secondary}" opacity="0.55"/>`
    : ''
  const fillA = isPointer ? secondary : accent
  const fillB = isPointer ? accent : secondary
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">',
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fillA}"/><stop offset="1" stop-color="${fillB}"/></linearGradient></defs>`,
    halo,
    `<path d="${ARROW_PATH}" fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linejoin="round"/>`,
    `<path d="${ARROW_PATH}" fill="url(#g)" stroke="#0f172a" stroke-width="1" stroke-linejoin="round"/>`,
    charm({ charm: isPointer ? '#ffffff' : '#fff7d6' }),
    '</svg>'
  ].join('')
}

export const toSvgDataUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`

export const buildCursorUris = (themeKey, colors) => ({
  defaultUri: toSvgDataUri(buildSvg(themeKey, colors, 'default')),
  pointerUri: toSvgDataUri(buildSvg(themeKey, colors, 'pointer'))
})

// CSS cursor values with sensible native fallbacks
export const buildCursorValues = (themeKey, colors) => {
  const { defaultUri, pointerUri } = buildCursorUris(themeKey, colors)
  return {
    defaultCursor: `url("${defaultUri}") ${HOTSPOT.x} ${HOTSPOT.y}, auto`,
    pointerCursor: `url("${pointerUri}") ${HOTSPOT.x} ${HOTSPOT.y}, pointer`
  }
}
