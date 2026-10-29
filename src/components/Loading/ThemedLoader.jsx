import Box from '@mui/material/Box'
import { useFxTheme } from '~/fx/fxThemeStore'

const ANIM = (name, duration, extra = '') => `${name} ${duration} ${extra}`.trim()
const BOX = { transformBox: 'fill-box', transformOrigin: 'center' }

// Each theme draws its own small animated scene (80x80). Colors come from the active theme.
const SCENES = {
  cosmos: ({ a, b }) => (
    <>
      <circle cx="40" cy="40" r="11" fill={b} />
      <ellipse cx="40" cy="40" rx="22" ry="7" fill="none" stroke={a} strokeWidth="1.6" opacity="0.7" transform="rotate(-18 40 40)" />
      <g style={{ ...BOX, animation: ANIM('fxOrbit', '2.2s', 'linear infinite') }}>
        <path d="M40 8 L42 14 L48 16 L42 18 L40 24 L38 18 L32 16 L38 14 Z" fill={a} />
      </g>
      {[[14, 20], [66, 24], [60, 62], [18, 60]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="#fff" style={{ ...BOX, animation: ANIM('fxTwinkle', `${1.4 + i * 0.3}s`, `ease-in-out ${i * 0.2}s infinite`) }} />
      ))}
    </>
  ),
  'wind-chime': ({ a, b }) => (
    <>
      <path d="M8 24 H26 M54 34 H72 M14 58 H34" stroke={a} strokeWidth="2" strokeLinecap="round" opacity="0.45" style={{ animation: ANIM('fxFloat', '2.4s', 'ease-in-out infinite') }} />
      <g style={{ transformOrigin: '40px 12px', animation: ANIM('fxSwing', '1.3s', 'ease-in-out infinite alternate') }}>
        <line x1="40" y1="8" x2="40" y2="26" stroke="#94a3b8" strokeWidth="1.6" />
        <path d="M26 44 C26 32 33 26 40 26 C47 26 54 32 54 44 Z" fill={a} opacity="0.92" />
        <rect x="26" y="44" width="28" height="3" rx="1.5" fill={b} />
        <line x1="40" y1="47" x2="40" y2="58" stroke="#94a3b8" strokeWidth="1.4" />
        <rect x="35" y="58" width="10" height="16" rx="2" fill={b} />
      </g>
    </>
  ),
  'sora-sky': ({ a, b }) => (
    <g style={{ animation: ANIM('fxFloat', '2.2s', 'ease-in-out infinite') }}>
      <ellipse cx="32" cy="24" rx="4.2" ry="11" fill="#fff" stroke={b} strokeWidth="1.4" />
      <ellipse cx="46" cy="24" rx="4.2" ry="11" fill="#fff" stroke={b} strokeWidth="1.4" />
      <g fill="#fff" stroke={a} strokeWidth="1.6">
        <circle cx="26" cy="52" r="12" />
        <circle cx="40" cy="46" r="16" />
        <circle cx="54" cy="52" r="12" />
        <rect x="26" y="52" width="28" height="12" stroke="none" />
      </g>
      <circle cx="35" cy="50" r="1.8" fill="#0f172a" />
      <circle cx="45" cy="50" r="1.8" fill="#0f172a" />
    </g>
  ),
  'sora-twilight': ({ a, b }) => (
    <>
      <g style={{ transformOrigin: '40px 14px', animation: ANIM('fxRock', '1.8s', 'ease-in-out infinite alternate') }}>
        <path d="M46 16 A24 24 0 1 0 64 52 A19 19 0 1 1 46 16 Z" fill={a} />
        <path d="M30 18 L40 30" stroke={b} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>
      {[[62, 22], [18, 58], [66, 62]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 4} L${x - 1.2} ${y + 1.2} L${x - 4} ${y} L${x - 1.2} ${y - 1.2} Z`} fill="#fff" style={{ ...BOX, animation: ANIM('fxTwinkle', `${1.3 + i * 0.4}s`, `ease-in-out ${i * 0.25}s infinite`) }} />
      ))}
    </>
  ),
  'sora-usagi': ({ a, b }) => (
    <>
      <ellipse cx="40" cy="72" rx="16" ry="3.4" fill="#0f172a" style={{ ...BOX, animation: ANIM('fxShadow', '1.1s', 'ease-in-out infinite') }} />
      <g style={{ ...BOX, animation: ANIM('fxHop', '1.1s', 'ease-in-out infinite') }}>
        <ellipse cx="31" cy="22" rx="5" ry="14" fill="#fff" stroke={b} strokeWidth="1.6" />
        <ellipse cx="49" cy="22" rx="5" ry="14" fill="#fff" stroke={b} strokeWidth="1.6" />
        <ellipse cx="31" cy="24" rx="2" ry="8" fill={a} opacity="0.5" />
        <ellipse cx="49" cy="24" rx="2" ry="8" fill={a} opacity="0.5" />
        <circle cx="40" cy="50" r="19" fill="#fff" stroke={b} strokeWidth="1.6" />
        <circle cx="33" cy="48" r="2.4" fill="#0f172a" />
        <circle cx="47" cy="48" r="2.4" fill="#0f172a" />
        <path d="M37 55 Q40 58 43 55" stroke="#0f172a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx="27" cy="54" r="3" fill={a} opacity="0.45" />
        <circle cx="53" cy="54" r="3" fill={a} opacity="0.45" />
      </g>
    </>
  ),
  furina: ({ a, b }) => (
    <>
      {[0, 1, 2].map(i => (
        <ellipse key={i} cx="40" cy="62" rx="22" ry="6" fill="none" stroke={a} strokeWidth="1.6" style={{ ...BOX, animation: ANIM('fxRipple', '1.8s', `ease-out ${i * 0.55}s infinite`) }} />
      ))}
      <g style={{ ...BOX, animation: ANIM('fxDrop', '1.8s', 'ease-in infinite') }}>
        <path d="M40 14 C40 14 52 28 52 37 A12 12 0 0 1 28 37 C28 28 40 14 40 14 Z" fill={a} stroke={b} strokeWidth="1.6" />
        <path d="M34 38 A6 6 0 0 0 40 44" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>
    </>
  ),
  nahida: ({ a, b }) => (
    <g style={{ transformOrigin: '40px 70px', animation: ANIM('fxSway', '2s', 'ease-in-out infinite alternate') }}>
      <g style={{ transformOrigin: '40px 70px', animation: ANIM('fxGrow', '1.6s', 'cubic-bezier(0.16, 1, 0.3, 1) infinite') }}>
        <path d="M40 72 C40 58 40 48 40 38" stroke={b} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M40 48 C24 48 16 36 16 28 C30 26 40 34 40 48 Z" fill={a} />
        <path d="M40 40 C40 24 50 14 66 14 C66 30 56 40 40 40 Z" fill={b} opacity="0.92" />
        <path d="M40 48 L24 34 M40 40 L58 22" stroke="#fff" strokeWidth="1.2" opacity="0.55" strokeLinecap="round" />
      </g>
    </g>
  )
}

// Spinning ring + tiny glyph, used inside buttons and other tight spaces
function InlineRing({ size, a, b, glyph }) {
  const ringWidth = Math.max(2, Math.round(size * 0.14))
  return (
    <Box
      component="span"
      role="presentation"
      sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0, position: 'relative' }}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0 25%, ${a} 60%, ${b} 100%)`,
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${ringWidth}px), #000 calc(100% - ${ringWidth}px))`,
          WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ringWidth}px), #000 calc(100% - ${ringWidth}px))`,
          animation: ANIM('fxSpin', '0.9s', 'linear infinite')
        }}
      />
      <Box component="span" sx={{ fontSize: size * 0.46, lineHeight: 1, animation: ANIM('fxPulse', '1.2s', 'ease-in-out infinite') }}>
        {glyph}
      </Box>
    </Box>
  )
}
// Themed loading indicator. `inline` renders a compact ring for buttons.
function ThemedLoader({ size = 72, inline = false, themeKey }) {
  const { key: activeKey, theme } = useFxTheme()
  const key = themeKey || activeKey
  const colors = { a: theme.accentColor, b: theme.secondaryAccent }
  const glyph = (theme.particleSymbols || ['✨'])[0]

  if (inline) return <InlineRing size={size} a={colors.a} b={colors.b} glyph={glyph} />

  const Scene = SCENES[key] || SCENES['sora-sky']
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ width: size, height: size, display: 'inline-flex', filter: `drop-shadow(0 6px 14px ${colors.a}55)` }}
    >
      <svg viewBox="0 0 80 80" width="100%" height="100%" aria-hidden="true">
        <Scene a={colors.a} b={colors.b} />
      </svg>
    </Box>
  )
}

export default ThemedLoader
