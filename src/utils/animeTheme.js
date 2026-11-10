import soraPortrait from '~/assets/sora.jpg'
import soraRibbon from '~/assets/sora/sora-ribbon.jpg'
import soraUsagiBloom from '~/assets/sora/sora-usagi-bloom.jpg'
import soraBunniesSofa from '~/assets/sora/sora-bunnies-sofa.jpg'
import soraCamellia from '~/assets/sora/sora-camellia.jpg'
import soraTwilightLake from '~/assets/sora/sora-twilight-lake.jpg'
import soraChibi from '~/assets/sora/sora-chibi.jpg'
import furinaHero from '~/assets/anime/furina-hero.jpg'
import furinaChibi from '~/assets/anime/furina-chibi.jpg'
import furinaSwan from '~/assets/anime/furina-swan.webp'
import nahidaHero from '~/assets/anime/nahida-hero.jpg'
import nahidaChibi from '~/assets/anime/nahida-chibi.jpg'
import nahidaLibrary from '~/assets/anime/nahida-library.jpg'
import cosmosHero from '~/assets/themes/cosmos-hero.jpg'
import cosmosNebula from '~/assets/themes/cosmos-nebula.jpg'
import cosmosStarlight from '~/assets/themes/cosmos-starlight.jpg'
import windSkyHero from '~/assets/themes/wind-sky-hero.jpg'
import windMeadow from '~/assets/themes/wind-meadow.jpg'
import windBreeze from '~/assets/themes/wind-breeze.jpg'

const PERSONA_STORAGE_KEY = 'chello_sora_persona_theme'

export const PRIMARY_THEME_KEYS = [
  'cosmos',
  'wind-chime',
  'sora-sky',
  'sora-twilight',
  'sora-usagi',
  'furina',
  'nahida'
]

export const ANIME_THEMES = {
  cosmos: {
    id: 'cosmos',
    chapterIndex: '01',
    name: 'Astral Cosmos • Milky Way & Zodiac',
    jpTitle: '星河と黄道十二宮 • 占星術の宙',
    element: 'Astral Zodiac',
    styleArchetype: 'data-terminal',
    archetypeLabel: 'Data Terminal • Precision Telemetry',
    awwwardsLabel: 'Kinetic Monolith • Celestial Grid',
    characterName: 'Celestial Observatory (星河の観測所)',
    defaultTrackId: 'cosmos-astral-harmony',
    quote: '“Across the tranquil Milky Way and twelve zodiac constellations, every requirement and system node aligns in quiet harmony.”',
    heroImage: cosmosHero,
    portraitImage: cosmosNebula,
    mascotImage: cosmosStarlight,
    accentColor: '#e5c058',
    secondaryAccent: '#818cf8',
    badgeBg: 'rgba(229, 192, 88, 0.18)',
    // Data-Terminal archetype: deep graphite-indigo with disciplined amber-gold signal
    appBarBgLight: 'linear-gradient(135deg, #131524 0%, #1a1e36 55%, #23294a 100%)',
    appBarBgDark: 'linear-gradient(135deg, #0d0f1a 0%, #131629 55%, #1b203b 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(19, 21, 36, 0.90) 0%, rgba(26, 30, 54, 0.86) 55%, rgba(35, 41, 74, 0.84) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(13, 15, 26, 0.92) 0%, rgba(19, 22, 41, 0.88) 60%, rgba(27, 32, 59, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(16, 19, 34, 0.50) 0%, rgba(20, 24, 44, 0.74) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(12, 14, 24, 0.62) 0%, rgba(17, 20, 38, 0.82) 100%)',
    columnBgLight: 'rgba(246, 247, 251, 0.94)',
    columnBgDark: 'rgba(19, 21, 34, 0.90)',
    columnBorder: 'rgba(229, 192, 88, 0.34)',
    surfaceTokens: {
      groundLight: '#f6f7fb',
      groundDark: '#0f111c',
      raisedLight: '#ffffff',
      raisedDark: '#161929',
      cardRadius: '10px',
      controlRadius: '8px'
    },
    interactiveTokens: {
      springCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
      cardHoverLift: '-2.5px',
      cardActiveScale: '0.985',
      spotlightColor: 'rgba(229, 192, 88, 0.16)',
      cardHoverShadowLight: '0 12px 28px -6px rgba(180, 83, 9, 0.18), 0 0 0 1px rgba(229, 192, 88, 0.50)',
      cardHoverShadowDark: '0 14px 34px -6px rgba(2, 6, 23, 0.78), 0 0 20px rgba(229, 192, 88, 0.24)',
      accentGradient: 'linear-gradient(135deg, #e5c058 0%, #818cf8 55%, #c084fc 100%)',
      glassBlur: '14px',
      signatureLabel: 'Deep-Space Telemetry • Astral Gold Radar Glow'
    },
    particleSymbols: ['✦', '🌌', '♈', '♌', '♎', '♓', '⭐']
  },
  'wind-chime': {
    id: 'wind-chime',
    chapterIndex: '02',
    name: 'Azure Breeze • Sky & Wind Chime',
    jpTitle: '青空と風鈴 • 涼風の調べ',
    element: 'Breeze & Furin',
    styleArchetype: 'framed-sheet',
    archetypeLabel: 'Framed Sheet • Mineral Slate',
    awwwardsLabel: 'Japanese Minimal • Ma (間) & Furin',
    characterName: 'Summer Furin Veranda (風鈴の縁側)',
    defaultTrackId: 'wind-breeze-furin',
    quote: '“A cool breeze drifts across the clear blue sky and fresh green meadow, carrying the gentle ring of glass wind chimes.”',
    heroImage: windSkyHero,
    portraitImage: windMeadow,
    mascotImage: windBreeze,
    accentColor: '#0ea5e9',
    secondaryAccent: '#10b981',
    badgeBg: 'rgba(14, 165, 233, 0.18)',
    // Framed-Sheet archetype: cool mineral slate with calm teal-petrol framing
    appBarBgLight: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 52%, #0f766e 100%)',
    appBarBgDark: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 55%, #115e59 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(12, 74, 110, 0.88) 0%, rgba(3, 105, 161, 0.84) 52%, rgba(15, 118, 110, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(8, 47, 73, 0.90) 0%, rgba(12, 74, 110, 0.86) 55%, rgba(17, 94, 89, 0.85) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(12, 74, 110, 0.34) 0%, rgba(15, 118, 110, 0.56) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(8, 47, 73, 0.56) 0%, rgba(15, 82, 87, 0.76) 100%)',
    columnBgLight: 'rgba(248, 251, 252, 0.94)',
    columnBgDark: 'rgba(12, 31, 44, 0.90)',
    columnBorder: 'rgba(14, 165, 233, 0.34)',
    surfaceTokens: {
      groundLight: '#f8fbfc',
      groundDark: '#091824',
      raisedLight: '#ffffff',
      raisedDark: '#0f2536',
      cardRadius: '12px',
      controlRadius: '9px'
    },
    interactiveTokens: {
      springCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
      cardHoverLift: '-2.5px',
      cardActiveScale: '0.984',
      spotlightColor: 'rgba(14, 165, 233, 0.14)',
      cardHoverShadowLight: '0 12px 28px -8px rgba(14, 165, 233, 0.22), 0 0 0 1px rgba(14, 165, 233, 0.45)',
      cardHoverShadowDark: '0 14px 32px -6px rgba(4, 47, 46, 0.70), 0 0 18px rgba(14, 165, 233, 0.22)',
      accentGradient: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 55%, #10b981 100%)',
      glassBlur: '13px',
      signatureLabel: 'Engawa Breeze • Kinetic Framed Sheet'
    },
    particleSymbols: ['🎐', '🍃', '☁️', '🌿', '✧']
  },
  'sora-sky': {
    id: 'sora-sky',
    chapterIndex: '03',
    name: 'Sora • Beyond the Distant Sky',
    jpTitle: '春日野 穹 • 遠い空へ',
    element: 'Distant Sky',
    styleArchetype: 'achromatic-ledger',
    archetypeLabel: 'Achromatic Ledger • High-Contrast Ink',
    awwwardsLabel: 'Swiss Editorial Grid • Distant Sky',
    characterName: 'Sora Kasugano (春日野 穹)',
    defaultTrackId: 'sora-toui-sora-e',
    quote: '“No matter how far we go, the summer sky above Okukozome connects every quiet promise we make.”',
    heroImage: soraUsagiBloom,
    portraitImage: soraPortrait,
    mascotImage: soraChibi,
    accentColor: '#38bdf8',
    secondaryAccent: '#ec4899',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    // Achromatic-Ledger archetype: crisp slate & alabaster with sky-blue data signal
    appBarBgLight: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
    appBarBgDark: 'linear-gradient(135deg, #090d16 0%, #0f172a 55%, #1e293b 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(15, 23, 42, 0.90) 0%, rgba(30, 41, 59, 0.86) 55%, rgba(51, 65, 85, 0.84) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(9, 13, 22, 0.92) 0%, rgba(15, 23, 42, 0.88) 60%, rgba(30, 41, 59, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(15, 23, 42, 0.48) 0%, rgba(15, 23, 42, 0.72) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(9, 13, 22, 0.66) 0%, rgba(15, 23, 42, 0.84) 100%)',
    columnBgLight: 'rgba(248, 250, 252, 0.95)',
    columnBgDark: 'rgba(15, 23, 42, 0.90)',
    columnBorder: 'rgba(56, 189, 248, 0.34)',
    surfaceTokens: {
      groundLight: '#f8fafc',
      groundDark: '#0b1120',
      raisedLight: '#ffffff',
      raisedDark: '#131c31',
      cardRadius: '11px',
      controlRadius: '8px'
    },
    interactiveTokens: {
      springCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
      cardHoverLift: '-2.5px',
      cardActiveScale: '0.985',
      spotlightColor: 'rgba(56, 189, 248, 0.15)',
      cardHoverShadowLight: '0 12px 26px -6px rgba(14, 165, 233, 0.20), 0 0 0 1px rgba(56, 189, 248, 0.48)',
      cardHoverShadowDark: '0 14px 32px -6px rgba(2, 6, 23, 0.76), 0 0 18px rgba(56, 189, 248, 0.22)',
      accentGradient: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 50%, #ec4899 100%)',
      glassBlur: '14px',
      signatureLabel: 'Swiss Horizon Ledger • Crisp Specular Hairlines'
    },
    particleSymbols: ['🕊️', '☁️', '🐰', '🎀', '✦']
  },
  'sora-twilight': {
    id: 'sora-twilight',
    chapterIndex: '04',
    name: 'Sora • Moonlit Black Ribbon',
    jpTitle: '春日野 穹 • 宵闇のリボン',
    element: 'Black Ribbon',
    styleArchetype: 'true-black-flat',
    archetypeLabel: 'True-Black Flat • Obsidian Carbon',
    awwwardsLabel: 'Nocturnal Luxury • Obsidian & Silver',
    characterName: 'Sora Kasugano (Moonlit Veranda)',
    defaultTrackId: 'sora-inori',
    quote: '“In the quiet silver moonlight, holding my black ribbon and Usagi plush is enough to keep moving forward.”',
    heroImage: soraRibbon,
    portraitImage: soraCamellia,
    mascotImage: soraChibi,
    accentColor: '#a78bfa',
    secondaryAccent: '#f472b6',
    badgeBg: 'rgba(167, 139, 250, 0.18)',
    // True-Black-Flat archetype: obsidian carbon with 1px structural borders and violet signal
    appBarBgLight: 'linear-gradient(135deg, #0a0d14 0%, #151726 55%, #221f3b 100%)',
    appBarBgDark: 'linear-gradient(135deg, #07090e 0%, #0e101c 55%, #18162c 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(10, 13, 20, 0.90) 0%, rgba(21, 23, 38, 0.86) 55%, rgba(34, 31, 59, 0.84) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(7, 9, 14, 0.94) 0%, rgba(14, 16, 28, 0.90) 60%, rgba(24, 22, 44, 0.88) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(10, 13, 20, 0.54) 0%, rgba(21, 23, 38, 0.76) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(7, 9, 14, 0.72) 0%, rgba(14, 16, 28, 0.88) 100%)',
    columnBgLight: 'rgba(246, 245, 252, 0.94)',
    columnBgDark: 'rgba(14, 16, 24, 0.92)',
    columnBorder: 'rgba(167, 139, 250, 0.34)',
    surfaceTokens: {
      groundLight: '#f6f5fc',
      groundDark: '#0a0d12',
      raisedLight: '#ffffff',
      raisedDark: '#12151e',
      cardRadius: '10px',
      controlRadius: '8px'
    },
    interactiveTokens: {
      springCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
      cardHoverLift: '-2px',
      cardActiveScale: '0.986',
      spotlightColor: 'rgba(167, 139, 250, 0.16)',
      cardHoverShadowLight: '0 12px 26px -6px rgba(124, 58, 237, 0.18), 0 0 0 1px rgba(167, 139, 250, 0.48)',
      cardHoverShadowDark: '0 14px 34px -6px rgba(0, 0, 0, 0.85), 0 0 20px rgba(167, 139, 250, 0.24)',
      accentGradient: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #818cf8 100%)',
      glassBlur: '16px',
      signatureLabel: 'OLED Twilight Ribbon • Violet-Silver Specular Rim'
    },
    particleSymbols: ['🎀', '🌙', '🐰', '✧', '🕊️']
  },
  'sora-usagi': {
    id: 'sora-usagi',
    chapterIndex: '05',
    name: 'Usagi • Patchwork Bunny Sanctuary',
    jpTitle: 'うさぎのぬいぐるみ • 春日野 穹',
    element: 'Usagi Plush',
    styleArchetype: 'pastel-consumer',
    archetypeLabel: 'Pastel Sanctuary • Soft Tactile',
    awwwardsLabel: 'Asymmetric Bento • Tactile Atelier',
    characterName: 'Sora & Usagi Plush (うさぎ)',
    defaultTrackId: 'sora-tomadoi',
    quote: '“Surrounded by soft button-eyed bunnies and afternoon sunlight — take your time, one gentle step at a time.”',
    heroImage: soraBunniesSofa,
    portraitImage: soraTwilightLake,
    mascotImage: soraChibi,
    accentColor: '#ec4899',
    secondaryAccent: '#a855f7',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    // Pastel-Consumer archetype: warm atmospheric sanctuary with rose-plum accents
    appBarBgLight: 'linear-gradient(135deg, #271538 0%, #3b1954 55%, #4c1d6e 100%)',
    appBarBgDark: 'linear-gradient(135deg, #180d24 0%, #27123c 55%, #371752 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(39, 21, 56, 0.88) 0%, rgba(59, 25, 84, 0.85) 55%, rgba(76, 29, 110, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(24, 13, 36, 0.92) 0%, rgba(39, 18, 60, 0.88) 60%, rgba(55, 23, 82, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(39, 21, 56, 0.48) 0%, rgba(59, 25, 84, 0.70) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(20, 11, 30, 0.68) 0%, rgba(39, 18, 60, 0.86) 100%)',
    columnBgLight: 'rgba(253, 248, 251, 0.94)',
    columnBgDark: 'rgba(24, 16, 36, 0.90)',
    columnBorder: 'rgba(236, 72, 153, 0.34)',
    surfaceTokens: {
      groundLight: '#fdf8fb',
      groundDark: '#130d1d',
      raisedLight: '#ffffff',
      raisedDark: '#1d142b',
      cardRadius: '14px',
      controlRadius: '10px'
    },
    interactiveTokens: {
      springCurve: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      cardHoverLift: '-3px',
      cardActiveScale: '0.978',
      spotlightColor: 'rgba(236, 72, 153, 0.16)',
      cardHoverShadowLight: '0 14px 30px -8px rgba(219, 39, 119, 0.22), 0 0 0 1.5px rgba(236, 72, 153, 0.50)',
      cardHoverShadowDark: '0 16px 36px -6px rgba(15, 7, 28, 0.78), 0 0 22px rgba(236, 72, 153, 0.26)',
      accentGradient: 'linear-gradient(135deg, #ec4899 0%, #c084fc 55%, #38bdf8 100%)',
      glassBlur: '16px',
      signatureLabel: 'Tactile Plush Spring • Bouncy Usagi Cushion'
    },
    particleSymbols: ['🐰', '🎀', '🌸', '✦', '🍬']
  },
  furina: {
    id: 'furina',
    chapterIndex: '06',
    name: 'Furina • Salon Solitaire & Fontaine',
    jpTitle: 'フリーナ • 罪人のフィナーレ',
    element: 'Hydro Opera',
    styleArchetype: 'accent-ladder',
    archetypeLabel: 'Accent Ladder • Structured Hydro',
    awwwardsLabel: 'Grand Editorial Spread • Fontaine',
    characterName: 'Furina de Fontaine (フリーナ)',
    defaultTrackId: 'furina-sinners-finale',
    quote: '“Let the curtains rise at Opera Epiclese! Every Change Request and Sprint milestone deserves a grand standing ovation!”',
    heroImage: furinaHero,
    portraitImage: furinaSwan,
    mascotImage: furinaChibi,
    accentColor: '#0284c7',
    secondaryAccent: '#6366f1',
    badgeBg: 'rgba(2, 132, 199, 0.18)',
    // Accent-Ladder archetype: disciplined sapphire ladder from deep navy to soft ice tint
    appBarBgLight: 'linear-gradient(135deg, #0b2545 0%, #133b6e 52%, #1d4ed8 100%)',
    appBarBgDark: 'linear-gradient(135deg, #061529 0%, #0b2545 55%, #172554 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(11, 37, 69, 0.88) 0%, rgba(19, 59, 110, 0.85) 55%, rgba(29, 78, 216, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(6, 21, 41, 0.92) 0%, rgba(11, 37, 69, 0.88) 60%, rgba(23, 37, 84, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(11, 37, 69, 0.46) 0%, rgba(15, 23, 42, 0.72) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(6, 21, 41, 0.64) 0%, rgba(15, 23, 42, 0.84) 100%)',
    columnBgLight: 'rgba(244, 249, 255, 0.94)',
    columnBgDark: 'rgba(10, 24, 44, 0.90)',
    columnBorder: 'rgba(56, 189, 248, 0.36)',
    surfaceTokens: {
      groundLight: '#f4f9ff',
      groundDark: '#071426',
      raisedLight: '#ffffff',
      raisedDark: '#0f223d',
      cardRadius: '12px',
      controlRadius: '9px'
    },
    interactiveTokens: {
      springCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
      cardHoverLift: '-2.5px',
      cardActiveScale: '0.984',
      spotlightColor: 'rgba(56, 189, 248, 0.16)',
      cardHoverShadowLight: '0 12px 28px -6px rgba(2, 132, 199, 0.22), 0 0 0 1px rgba(56, 189, 248, 0.52)',
      cardHoverShadowDark: '0 16px 36px -6px rgba(2, 12, 27, 0.82), 0 0 22px rgba(56, 189, 248, 0.25)',
      accentGradient: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 55%, #fbbf24 100%)',
      glassBlur: '16px',
      signatureLabel: 'Grand Opera Hydro • Sapphire & Gold Stage Spotlight'
    },
    particleSymbols: ['💧', '🎩', '🍰', '✨', '🌊']
  },
  nahida: {
    id: 'nahida',
    chapterIndex: '07',
    name: 'Nahida • Sanctuary of Surasthana',
    jpTitle: 'ナヒーダ • 知恵の主',
    element: 'Dendro Wisdom',
    styleArchetype: 'editorial-greeting',
    archetypeLabel: 'Editorial Studio • Botanical Clarity',
    awwwardsLabel: 'Botanical Folio • Irminsul Archive',
    characterName: 'Nahida • Lesser Lord Kusanali (ナヒーダ)',
    defaultTrackId: 'nahida-sumeru-main',
    quote: '“Every system requirement and FRD document is a branch of the Irminsul tree — let’s connect all knowledge together.”',
    heroImage: nahidaLibrary,
    portraitImage: nahidaHero,
    mascotImage: nahidaChibi,
    accentColor: '#10b981',
    secondaryAccent: '#84cc16',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    // Editorial-Greeting archetype: calm botanical sanctuary with tonal separation
    appBarBgLight: 'linear-gradient(135deg, #064e3b 0%, #047857 52%, #0f766e 100%)',
    appBarBgDark: 'linear-gradient(135deg, #03261d 0%, #064e3b 55%, #115e59 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(6, 78, 59, 0.88) 0%, rgba(4, 120, 87, 0.85) 55%, rgba(15, 118, 110, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(3, 38, 29, 0.92) 0%, rgba(6, 78, 59, 0.88) 60%, rgba(17, 94, 89, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(6, 78, 59, 0.46) 0%, rgba(15, 23, 42, 0.70) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(3, 38, 29, 0.64) 0%, rgba(15, 23, 42, 0.84) 100%)',
    columnBgLight: 'rgba(246, 252, 249, 0.94)',
    columnBgDark: 'rgba(7, 31, 26, 0.90)',
    columnBorder: 'rgba(16, 185, 129, 0.36)',
    surfaceTokens: {
      groundLight: '#f6fcf9',
      groundDark: '#051a15',
      raisedLight: '#ffffff',
      raisedDark: '#0b2922',
      cardRadius: '12px',
      controlRadius: '9px'
    },
    interactiveTokens: {
      springCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
      cardHoverLift: '-2.5px',
      cardActiveScale: '0.984',
      spotlightColor: 'rgba(16, 185, 129, 0.15)',
      cardHoverShadowLight: '0 12px 28px -6px rgba(16, 185, 129, 0.20), 0 0 0 1px rgba(16, 185, 129, 0.48)',
      cardHoverShadowDark: '0 14px 34px -6px rgba(5, 22, 14, 0.78), 0 0 20px rgba(16, 185, 129, 0.24)',
      accentGradient: 'linear-gradient(135deg, #10b981 0%, #84cc16 55%, #2dd4bf 100%)',
      glassBlur: '14px',
      signatureLabel: 'Sumeru Sanctuary • Organic Botanical Dew Glow'
    },
    particleSymbols: ['🌿', '🍀', '✨', '📖', '🌱']
  }
}

export const PRIMARY_THEMES_LIST = PRIMARY_THEME_KEYS.map(key => ANIME_THEMES[key])

export const getThemeInteractiveTokens = (themeKey) => {
  const normalized = PRIMARY_THEME_KEYS.includes(themeKey) ? themeKey : 'sora-sky'
  const theme = ANIME_THEMES[normalized] || ANIME_THEMES['sora-sky']
  return theme.interactiveTokens || ANIME_THEMES['sora-sky'].interactiveTokens
}

export const ELEMENTAL_LABELS = [
  { id: 'cosmos', title: '🌌 Astral Zodiac • Core Architecture', color: '#8b5cf6' },
  { id: 'breeze', title: '🎐 Azure Breeze • Ready for Deploy', color: '#0d9488' },
  { id: 'sky', title: '☁️ Distant Sky • Core CR', color: '#0284c7' },
  { id: 'ribbon', title: '🎀 Black Ribbon • High Priority', color: '#6366f1' },
  { id: 'usagi', title: '🐰 Usagi Plush • In Testing', color: '#db2777' },
  { id: 'hydro', title: '💧 Fontaine Hydro • FRD Linked', color: '#0ea5e9' },
  { id: 'dendro', title: '🌿 Sumeru Dendro • Knowledge Graph', color: '#10b981' },
  { id: 'urgent', title: '⚡ Blocking / Due Soon Risk', color: '#e11d48' }
]

export const SORA_PRESET_COVERS = [
  { key: 'preset:cosmos-hero', label: '🌌 Milky Way & Starlight Sail', url: cosmosHero },
  { key: 'preset:cosmos-nebula', label: '🪐 Andromeda Galaxy Nebula', url: cosmosNebula },
  { key: 'preset:cosmos-starlight', label: '🌠 Shooting Star & Zodiac Sky', url: cosmosStarlight },
  { key: 'preset:wind-sky', label: '🎐 Azure Sky & Summer Clouds', url: windSkyHero },
  { key: 'preset:wind-meadow', label: '🍃 Emerald Breeze Meadow', url: windMeadow },
  { key: 'preset:wind-breeze', label: '☁️ Gentle Horizon Breeze', url: windBreeze },
  { key: 'preset:sora-sky', label: '🌸 Sora & Usagi Bloom', url: soraUsagiBloom },
  { key: 'preset:sora-twilight', label: '🎀 Sora Black Ribbon', url: soraRibbon },
  { key: 'preset:sora-usagi', label: '🐰 Usagi Plush Sofa', url: soraBunniesSofa },
  { key: 'preset:sora-camellia', label: '💮 White Camellia', url: soraCamellia },
  { key: 'preset:sora-lake', label: '🌅 Okukozome Lake', url: soraTwilightLake },
  { key: 'preset:sora-chibi', label: '✨ Chibi Sora & Usagi', url: soraChibi },
  { key: 'preset:furina-salon', label: '🎩 Furina • Fontaine Promenade', url: furinaHero },
  { key: 'preset:furina-chibi', label: '💧 Chibi Furina', url: furinaChibi },
  { key: 'preset:furina-swan', label: '🦢 Furina • Moonlit Swans', url: furinaSwan },
  { key: 'preset:nahida-sanctuary', label: '🌿 Nahida • Surasthana Library', url: nahidaLibrary },
  { key: 'preset:nahida-chibi', label: '🍀 Chibi Nahida Meadow', url: nahidaChibi }
]

export const DEFAULT_SPRINT_TEMPLATE = {
  id: 'standard-agile-sprint',
  title: 'Sprint • Quản lý CR & Đặc tả FRD',
  description: 'Mẫu Sprint tiêu chuẩn thống nhất cho toàn bộ Workspace: Tích hợp sẵn Sprint Matrix, Kanban 3 cột chủ đề CR, đặc tả FRD trực quan (BNPL-945, BNPL-946, BNPL-947), Timeline & Obsidian Graph.',
  badge: '📋 Unified Sprint Template',
  modules: [
    '01 / Sprint Matrix & Resource Roster (Mặc định khi mở bảng)',
    '02 / Kanban Board (3 cột Chủ đề CR: Usage Limit, Credit Scoring, Settlement)',
    '03 / Thẻ CR mẫu (BNPL-945, BNPL-946, BNPL-947) & Tài liệu FRD chuẩn A4 PDF',
    '04 / Timeline Gantt & Sơ đồ tri thức Obsidian [[WikiLink]]'
  ]
}

// Legacy alias kept for backward compatibility; all boards/sprints share DEFAULT_SPRINT_TEMPLATE
export const ANIME_BOARD_TEMPLATES = [DEFAULT_SPRINT_TEMPLATE]

export const normalizeThemeKey = (key) => {
  if (key === 'celestia') return 'sora-usagi'
  return PRIMARY_THEME_KEYS.includes(key) ? key : 'sora-sky'
}

export const getSavedPersonaTheme = () => {
  try {
    const saved = localStorage.getItem(PERSONA_STORAGE_KEY)
    return normalizeThemeKey(saved)
  } catch (error) {
    return 'sora-sky'
  }
}

export const savePersonaTheme = (themeKey) => {
  try {
    const normalized = normalizeThemeKey(themeKey)
    localStorage.setItem(PERSONA_STORAGE_KEY, normalized)
    window.dispatchEvent(new CustomEvent('chello-persona-change', { detail: normalized }))
  } catch (error) {
    // Ignore localStorage errors
  }
}

export const resolveCardCoverUrl = (coverValue) => {
  if (!coverValue) return null
  if (coverValue === 'preset:template-default') {
    const currentTheme = ANIME_THEMES[getSavedPersonaTheme()] || ANIME_THEMES['sora-sky']
    return currentTheme.heroImage
  }
  if (coverValue === 'preset:cosmos' || coverValue === 'preset:cosmos-hero' || coverValue === 'preset:cosmos-galaxy') return cosmosHero
  if (coverValue === 'preset:cosmos-nebula') return cosmosNebula
  if (coverValue === 'preset:cosmos-starlight') return cosmosStarlight
  if (coverValue === 'preset:wind-chime' || coverValue === 'preset:wind-sky' || coverValue === 'preset:wind-chime-sky') return windSkyHero
  if (coverValue === 'preset:wind-meadow') return windMeadow
  if (coverValue === 'preset:wind-breeze') return windBreeze
  if (coverValue === 'preset:sora-sky') return soraUsagiBloom
  if (coverValue === 'preset:sora-twilight') return soraRibbon
  if (coverValue === 'preset:sora-usagi') return soraBunniesSofa
  if (coverValue === 'preset:sora-camellia') return soraCamellia
  if (coverValue === 'preset:sora-lake') return soraTwilightLake
  if (coverValue === 'preset:sora-chibi') return soraChibi
  if (coverValue === 'preset:sora-portrait') return soraPortrait
  if (coverValue === 'preset:furina' || coverValue === 'preset:furina-salon') return furinaHero
  if (coverValue === 'preset:furina-chibi') return furinaChibi
  if (coverValue === 'preset:furina-swan') return furinaSwan
  if (coverValue === 'preset:nahida' || coverValue === 'preset:nahida-sanctuary') return nahidaLibrary
  if (coverValue === 'preset:nahida-chibi') return nahidaChibi
  return coverValue
}

export {
  soraPortrait,
  soraRibbon,
  soraUsagiBloom,
  soraBunniesSofa,
  soraCamellia,
  soraTwilightLake,
  soraChibi,
  furinaHero,
  furinaChibi,
  furinaSwan,
  nahidaHero,
  nahidaChibi,
  nahidaLibrary,
  cosmosHero,
  cosmosNebula,
  cosmosStarlight,
  windSkyHero,
  windMeadow,
  windBreeze
}
