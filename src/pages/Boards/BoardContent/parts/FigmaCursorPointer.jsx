import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const SPRING_EASING = 'linear(0, 0.452 7.8%, 0.801 16.1%, 1.005 24.9%, 1.055 31.3%, 1.052 38%, 1.016 51.6%, 0.998 66.4%, 1)'

function CursorIcon({ tool = 'arrow', color = '#0D99FF' }) {
  if (tool === 'cross') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ overflow: 'visible', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
        <line x1="9" y1="1" x2="9" y2="17" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <line x1="1" y1="9" x2="17" y2="9" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <line x1="9" y1="1" x2="9" y2="17" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="1" y1="9" x2="17" y2="9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <rect x="7" y="7" width="4" height="4" fill="#ffffff" stroke={color} strokeWidth="1.3" />
      </svg>
    )
  }

  if (tool === 'ibeam') {
    return (
      <svg width="16" height="20" viewBox="0 0 16 20" style={{ overflow: 'visible', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
        <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
          <line x1="4" y1="2" x2="10" y2="2" />
          <line x1="7" y1="2" x2="7" y2="16" />
          <line x1="4" y1="16" x2="10" y2="16" />
        </g>
        <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
          <line x1="4" y1="2" x2="10" y2="2" />
          <line x1="7" y1="2" x2="7" y2="16" />
          <line x1="4" y1="16" x2="10" y2="16" />
        </g>
      </svg>
    )
  }

  if (tool === 'dup') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.38))' }}>
        <path
          d="M1 1L1 15L4.8 11.5L7.6 17.5L9.8 16.5L7 10.5L12 10.5Z"
          transform="translate(5, 5)"
          fill="#ffffff"
          stroke={color}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M1 1L1 15L4.8 11.5L7.6 17.5L9.8 16.5L7 10.5L12 10.5Z"
          fill={color}
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.38))' }}>
      <path
        d="M1 1L1 15L4.8 11.5L7.6 17.5L9.8 16.5L7 10.5L12 10.5Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FigmaCursorPointer({
  x = 0,
  y = 0,
  name = 'Agent',
  color = '#0D99FF',
  tool = 'arrow',
  badge = '',
  isAi = false,
  smoothTransition = false
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: isAi ? 45 : 35,
        willChange: 'transform',
        transform: `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`,
        transition: smoothTransition
          ? `transform 380ms ${SPRING_EASING}, opacity 180ms ease-out`
          : 'none',
        '@supports not (animation-timing-function: linear(0, 1))': {
          transition: smoothTransition
            ? 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease-out'
            : 'none'
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'opacity 150ms ease-out'
        }
      }}
    >
      <CursorIcon tool={tool} color={color} />

      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.6,
          mt: '-2px',
          ml: '12px',
          px: 0.85,
          py: 0.25,
          borderRadius: '6px',
          bgcolor: color,
          color: '#ffffff',
          boxShadow: isAi
            ? `0 4px 14px ${color}88, 0 0 0 1.5px rgba(255,255,255,0.85)`
            : '0 2px 6px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.35)',
          whiteSpace: 'nowrap'
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.01em',
            lineHeight: 1.2,
            fontFamily: '"Plus Jakarta Sans", Inter, system-ui, sans-serif'
          }}
        >
          {name}
        </Typography>

        {badge && (
          <Typography
            component="span"
            sx={{
              px: 0.55,
              py: 0.1,
              borderRadius: '4px',
              bgcolor: 'rgba(15, 23, 42, 0.72)',
              color: '#f8fafc',
              fontSize: '0.62rem',
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", Consolas, monospace',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {badge}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default FigmaCursorPointer
