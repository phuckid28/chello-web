import soraPortrait from '~/assets/sora.jpg'
import soraRibbon from '~/assets/sora/sora-ribbon.jpg'
import soraUsagiBloom from '~/assets/sora/sora-usagi-bloom.jpg'
import soraBunniesSofa from '~/assets/sora/sora-bunnies-sofa.jpg'
import soraCamellia from '~/assets/sora/sora-camellia.jpg'
import soraTwilightLake from '~/assets/sora/sora-twilight-lake.jpg'
import soraChibi from '~/assets/sora/sora-chibi.jpg'
import furinaHero from '~/assets/anime/furina-hero.jpg'
import furinaChibi from '~/assets/anime/furina-chibi.jpg'
import furinaSwan from '~/assets/anime/furina-swan.png'
import nahidaHero from '~/assets/anime/nahida-hero.jpg'
import nahidaChibi from '~/assets/anime/nahida-chibi.jpg'
import nahidaLibrary from '~/assets/anime/nahida-library.jpg'

const PERSONA_STORAGE_KEY = 'chello_sora_persona_theme'

export const PRIMARY_THEME_KEYS = [
  'sora-sky',
  'sora-twilight',
  'sora-usagi',
  'furina',
  'nahida'
]

export const ANIME_THEMES = {
  'sora-sky': {
    id: 'sora-sky',
    name: 'Sora • Beyond the Distant Sky',
    jpTitle: '春日野 穹 • 遠い空へ (Yosuga no Sora)',
    element: 'Distant Sky',
    characterName: 'Sora Kasugano (春日野 穹)',
    defaultTrackId: 'sora-toui-sora-e',
    quote: '“No matter how far we go, the summer sky above Okukozome connects every quiet promise we make.”',
    heroImage: soraUsagiBloom,
    portraitImage: soraPortrait,
    mascotImage: soraChibi,
    accentColor: '#7dd3fc',
    secondaryAccent: '#f472b6',
    badgeBg: 'rgba(125, 211, 252, 0.22)',
    appBarBgLight: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    appBarBgDark: 'linear-gradient(135deg, #090d16 0%, #0f172a 55%, #1e293b 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.84) 55%, rgba(51, 65, 85, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(9, 13, 22, 0.92) 0%, rgba(15, 23, 42, 0.88) 60%, rgba(30, 41, 59, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(15, 23, 42, 0.52) 0%, rgba(15, 23, 42, 0.74) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(9, 13, 22, 0.68) 0%, rgba(15, 23, 42, 0.86) 100%)',
    columnBgLight: 'rgba(248, 250, 252, 0.90)',
    columnBgDark: 'rgba(15, 23, 42, 0.86)',
    columnBorder: 'rgba(125, 211, 252, 0.40)',
    particleSymbols: ['🕊️', '☁️', '🐰', '🎀', '✦']
  },
  'sora-twilight': {
    id: 'sora-twilight',
    name: 'Sora • Moonlit Black Ribbon',
    jpTitle: '春日野 穹 • 宵闇のリボン',
    element: 'Black Ribbon',
    characterName: 'Sora Kasugano (Moonlit Veranda)',
    defaultTrackId: 'sora-inori',
    quote: '“In the quiet silver moonlight, holding my black ribbon and Usagi plush is enough to keep moving forward.”',
    heroImage: soraRibbon,
    portraitImage: soraCamellia,
    mascotImage: soraChibi,
    accentColor: '#a78bfa',
    secondaryAccent: '#f472b6',
    badgeBg: 'rgba(167, 139, 250, 0.22)',
    appBarBgLight: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 55%, #312e81 100%)',
    appBarBgDark: 'linear-gradient(135deg, #050507 0%, #0f0e26 55%, #1e1b4b 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(9, 9, 11, 0.88) 0%, rgba(30, 27, 75, 0.84) 55%, rgba(49, 46, 129, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(5, 5, 7, 0.92) 0%, rgba(15, 14, 38, 0.88) 60%, rgba(30, 27, 75, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(9, 9, 11, 0.56) 0%, rgba(30, 27, 75, 0.76) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(5, 5, 7, 0.72) 0%, rgba(15, 14, 38, 0.88) 100%)',
    columnBgLight: 'rgba(245, 243, 255, 0.90)',
    columnBgDark: 'rgba(15, 14, 34, 0.86)',
    columnBorder: 'rgba(167, 139, 250, 0.40)',
    particleSymbols: ['🎀', '🌙', '🐰', '✧', '🕊️']
  },
  'sora-usagi': {
    id: 'sora-usagi',
    name: 'Usagi • Patchwork Bunny Sanctuary',
    jpTitle: 'うさぎのぬいぐるみ • 春日野 穹',
    element: 'Usagi Plush',
    characterName: 'Sora & Usagi Plush (うさぎ)',
    defaultTrackId: 'sora-tomadoi',
    quote: '“Surrounded by soft button-eyed bunnies and afternoon sunlight — take your time, one gentle step at a time.”',
    heroImage: soraBunniesSofa,
    portraitImage: soraTwilightLake,
    mascotImage: soraChibi,
    accentColor: '#f472b6',
    secondaryAccent: '#c084fc',
    badgeBg: 'rgba(244, 114, 182, 0.22)',
    appBarBgLight: 'linear-gradient(135deg, #18181b 0%, #3b0764 55%, #4c1d95 100%)',
    appBarBgDark: 'linear-gradient(135deg, #09090b 0%, #27123c 55%, #3b0764 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(24, 24, 27, 0.88) 0%, rgba(59, 7, 100, 0.84) 55%, rgba(76, 29, 149, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(9, 9, 11, 0.92) 0%, rgba(39, 18, 60, 0.88) 60%, rgba(59, 7, 100, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(24, 24, 27, 0.52) 0%, rgba(59, 7, 100, 0.72) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(9, 9, 11, 0.70) 0%, rgba(39, 18, 60, 0.86) 100%)',
    columnBgLight: 'rgba(253, 242, 248, 0.90)',
    columnBgDark: 'rgba(24, 16, 36, 0.86)',
    columnBorder: 'rgba(244, 114, 182, 0.40)',
    particleSymbols: ['🐰', '🎀', '🌸', '✦', '🍬']
  },
  furina: {
    id: 'furina',
    name: 'Furina • Salon Solitaire & Fontaine',
    jpTitle: 'フリーナ • 罪人のフィナーレ (Fontaine)',
    element: 'Hydro Opera',
    characterName: 'Furina de Fontaine (フリーナ)',
    defaultTrackId: 'furina-sinners-finale',
    quote: '“Let the curtains rise at Opera Epiclese! Every Change Request and Sprint milestone deserves a grand standing ovation!”',
    heroImage: furinaHero,
    portraitImage: furinaSwan,
    mascotImage: furinaChibi,
    accentColor: '#38bdf8',
    secondaryAccent: '#60a5fa',
    badgeBg: 'rgba(56, 189, 248, 0.24)',
    appBarBgLight: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 50%, #1e3a8a 100%)',
    appBarBgDark: 'linear-gradient(135deg, #041829 0%, #082f49 55%, #172554 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(8, 47, 73, 0.88) 0%, rgba(12, 74, 110, 0.84) 55%, rgba(30, 58, 138, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(4, 24, 41, 0.92) 0%, rgba(8, 47, 73, 0.88) 60%, rgba(23, 37, 84, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(8, 47, 73, 0.48) 0%, rgba(15, 23, 42, 0.74) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(4, 24, 41, 0.66) 0%, rgba(15, 23, 42, 0.86) 100%)',
    columnBgLight: 'rgba(240, 249, 255, 0.91)',
    columnBgDark: 'rgba(10, 25, 47, 0.87)',
    columnBorder: 'rgba(56, 189, 248, 0.44)',
    particleSymbols: ['💧', '🎩', '🍰', '✨', '🌊']
  },
  nahida: {
    id: 'nahida',
    name: 'Nahida • Sanctuary of Surasthana',
    jpTitle: 'ナヒーダ • 知恵の主 (Sumeru)',
    element: 'Dendro Wisdom',
    characterName: 'Nahida • Lesser Lord Kusanali (ナヒーダ)',
    defaultTrackId: 'nahida-sumeru-main',
    quote: '“Every system requirement and FRD document is a branch of the Irminsul tree — let’s connect all knowledge together.”',
    heroImage: nahidaLibrary,
    portraitImage: nahidaHero,
    mascotImage: nahidaChibi,
    accentColor: '#34d399',
    secondaryAccent: '#a3e635',
    badgeBg: 'rgba(52, 211, 153, 0.24)',
    appBarBgLight: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #115e59 100%)',
    appBarBgDark: 'linear-gradient(135deg, #022c22 0%, #064e3b 55%, #134e4a 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(6, 78, 59, 0.88) 0%, rgba(6, 95, 70, 0.84) 55%, rgba(17, 94, 89, 0.82) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(2, 44, 34, 0.92) 0%, rgba(6, 78, 59, 0.88) 60%, rgba(19, 78, 74, 0.86) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(6, 78, 59, 0.48) 0%, rgba(15, 23, 42, 0.72) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(2, 44, 34, 0.66) 0%, rgba(15, 23, 42, 0.86) 100%)',
    columnBgLight: 'rgba(236, 253, 245, 0.91)',
    columnBgDark: 'rgba(6, 34, 29, 0.87)',
    columnBorder: 'rgba(52, 211, 153, 0.44)',
    particleSymbols: ['🌿', '🍀', '✨', '📖', '🌱']
  }
}

// Backward-compatible alias
ANIME_THEMES.celestia = ANIME_THEMES['sora-usagi']

export const PRIMARY_THEMES_LIST = PRIMARY_THEME_KEYS.map(key => ANIME_THEMES[key])

export const ELEMENTAL_LABELS = [
  { id: 'sky', title: '☁️ Distant Sky • Core CR', color: '#0284c7' },
  { id: 'ribbon', title: '🎀 Black Ribbon • High Priority', color: '#6366f1' },
  { id: 'usagi', title: '🐰 Usagi Plush • BA Analysis', color: '#db2777' },
  { id: 'hydro', title: '💧 Fontaine Hydro • FRD Ready', color: '#0ea5e9' },
  { id: 'dendro', title: '🌿 Sumeru Dendro • Knowledge Link', color: '#10b981' },
  { id: 'message', title: '💌 UAT & Sign-off • Review', color: '#d97706' },
  { id: 'urgent', title: '⚡ Blocker / Overdue Risk', color: '#e11d48' }
]

export const SORA_PRESET_COVERS = [
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

export const ANIME_BOARD_TEMPLATES = [
  {
    id: 'sora-okukozome',
    title: 'Sprint 34 • Sora Distant Sky BA Hub',
    description: 'Theo dõi CR, FRD và tiến độ Sprint 34 với sắc trắng bạc & xanh bầu trời của Sora Kasugano.',
    theme: 'sora-sky',
    badge: '☁️ Sora • Distant Sky'
  },
  {
    id: 'furina-salon-solitaire',
    title: 'Fontaine Opera • Furina CR & Product Hub',
    description: 'Không gian quản trị CR & nghiệm thu UAT lộng lẫy sắc xanh Hydro vùng Fontaine cùng Chibi Furina.',
    theme: 'furina',
    badge: '💧 Furina • Fontaine'
  },
  {
    id: 'nahida-irminsul-kb',
    title: 'Sanctuary of Surasthana • Nahida FRD Hub',
    description: 'Tập trung tri thức hệ thống, mô hình hóa nghiệp vụ và liên kết tài liệu FRD cùng Chibi Nahida.',
    theme: 'nahida',
    badge: '🌿 Nahida • Sumeru'
  },
  {
    id: 'sora-moonlit-ribbon',
    title: 'Moonlit Black Ribbon • BA Studio',
    description: 'Bảng phân tích nghiệp vụ tĩnh lặng dưới ánh trăng tím bạc cùng dải ruy-băng đen của Sora.',
    theme: 'sora-twilight',
    badge: '🎀 Sora • Black Ribbon'
  },
  {
    id: 'sora-usagi-sanctuary',
    title: 'Usagi Plush • Sprint Backlog Sanctuary',
    description: 'Không gian quản lý backlog nhẹ nhàng cùng Chibi Sora và thỏ bông Usagi.',
    theme: 'sora-usagi',
    badge: '🐰 Sora • Usagi Plush'
  }
]

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
  nahidaLibrary
}
