import SvgIcon from '@mui/material/SvgIcon'

/**
 * Custom SVG Icon of Sora Kasugano's iconic button-eyed Stuffed Rabbit (Usagi Plush)
 * from Yosuga no Sora — used for Board/Card emblems, Mascot badges, and Focus Timer.
 */
export function SoraBunnyIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 64 64">
      {/* Left floppy ear */}
      <path
        d="M24 18 C16 6, 6 12, 8 28 C9 34, 15 36, 20 30 Z"
        fill="#27272a"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <path
        d="M21 20 C16 12, 11 16, 12 26"
        fill="none"
        stroke="#f472b6"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Right raised/floppy ear */}
      <path
        d="M40 18 C48 5, 58 10, 56 26 C55 32, 49 34, 44 28 Z"
        fill="#3f3f46"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      {/* Patchwork Plush Head (half charcoal, half ash-silver) */}
      <circle
        cx="32"
        cy="34"
        r="16"
        fill="#27272a"
        stroke="#f8fafc"
        strokeWidth="2"
      />
      {/* Patchwork seam down the middle */}
      <path
        d="M32 18 L32 50"
        stroke="#94a3b8"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
      {/* Left Button Eye with X stitch */}
      <circle cx="25.5" cy="33" r="3.6" fill="#09090b" stroke="#cbd5e1" strokeWidth="1.2" />
      <path d="M24 31.5 L27 34.5 M27 31.5 L24 34.5" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" />
      {/* Right Button Eye with X stitch */}
      <circle cx="38.5" cy="33" r="3.6" fill="#09090b" stroke="#cbd5e1" strokeWidth="1.2" />
      <path d="M37 31.5 L40 34.5 M40 31.5 L37 34.5" stroke="#f472b6" strokeWidth="1.3" strokeLinecap="round" />
      {/* Stitched nose & mouth */}
      <path
        d="M30.5 38.5 L33.5 38.5 L32 40.5 Z"
        fill="#f472b6"
      />
      <path
        d="M32 40.5 L30 43 M32 40.5 L34 43"
        stroke="#e2e8f0"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Signature Neck Ribbon Bow */}
      <path
        d="M22 48 L32 51 L22 55 Z"
        fill="#f472b6"
        stroke="#fce7f3"
        strokeWidth="1.2"
      />
      <path
        d="M42 48 L32 51 L42 55 Z"
        fill="#818cf8"
        stroke="#e0e7ff"
        strokeWidth="1.2"
      />
      <circle cx="32" cy="51.5" r="2.8" fill="#f8fafc" />
    </SvgIcon>
  )
}

/**
 * Custom SVG Icon of Sora Kasugano's Gothic Black Twin-Tail Hair Ribbon & Cross Pendant
 */
export function SoraRibbonIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 64 64">
      {/* Left Ribbon Wing */}
      <path
        d="M30 28 C18 14, 6 18, 10 32 C12 39, 22 38, 30 32 Z"
        fill="#18181b"
        stroke="#cbd5e1"
        strokeWidth="2"
      />
      {/* Right Ribbon Wing */}
      <path
        d="M34 28 C46 14, 58 18, 54 32 C52 39, 42 38, 34 32 Z"
        fill="#18181b"
        stroke="#cbd5e1"
        strokeWidth="2"
      />
      {/* Flowing Ribbon Tails */}
      <path
        d="M29 33 L18 56 L25 53 L31 36 Z"
        fill="#27272a"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      <path
        d="M35 33 L46 56 L39 53 L33 36 Z"
        fill="#27272a"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      {/* Center Silver Brooch & Cross */}
      <circle cx="32" cy="30" r="4.5" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
      <path d="M32 37 L32 49 M28.5 41.5 L35.5 41.5" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
    </SvgIcon>
  )
}

export default SoraBunnyIcon
