import soraPortrait from '~/assets/sora.jpg'
import soraRibbon from '~/assets/sora/sora-ribbon.jpg'
import soraUsagiBloom from '~/assets/sora/sora-usagi-bloom.jpg'
import soraBunniesSofa from '~/assets/sora/sora-bunnies-sofa.jpg'
import soraCamellia from '~/assets/sora/sora-camellia.jpg'
import soraTwilightLake from '~/assets/sora/sora-twilight-lake.jpg'
import soraChibi from '~/assets/sora/sora-chibi.jpg'

const PERSONA_STORAGE_KEY = 'chello_sora_persona_theme'

export const PRIMARY_THEME_KEYS = ['sora-sky', 'sora-twilight', 'sora-usagi']

export const ANIME_THEMES = {
  'sora-sky': {
    id: 'sora-sky',
    name: 'Sora • Beyond the Distant Sky',
    jpTitle: '春日野 穹 • 遠い空へ (Yosuga no Sora)',
    element: 'Distant Sky',
    characterName: 'Sora Kasugano (春日野 穹)',
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
  }
}

// Backward-compatible aliases for existing boards stored with legacy theme keys
ANIME_THEMES.furina = ANIME_THEMES['sora-sky']
ANIME_THEMES.nahida = ANIME_THEMES['sora-twilight']
ANIME_THEMES.celestia = ANIME_THEMES['sora-usagi']

export const PRIMARY_THEMES_LIST = PRIMARY_THEME_KEYS.map(key => ANIME_THEMES[key])

export const ELEMENTAL_LABELS = [
  { id: 'sky', title: '☁️ Distant Sky • Core', color: '#0284c7' },
  { id: 'ribbon', title: '🎀 Black Ribbon • Priority', color: '#6366f1' },
  { id: 'usagi', title: '🐰 Usagi Plush • Companion', color: '#db2777' },
  { id: 'moonlight', title: '🌙 Moonlit Veranda • Research', color: '#7c3aed' },
  { id: 'camellia', title: '🌸 White Camellia • UI/UX Polish', color: '#0d9488' },
  { id: 'message', title: '💌 Flip-Phone SMS • Review', color: '#d97706' },
  { id: 'urgent', title: '⚡ Summer Storm • Hotfix', color: '#e11d48' }
]

export const SORA_PRESET_COVERS = [
  { key: 'preset:sora-sky', label: '🌸 Sora & Usagi Bloom', url: soraUsagiBloom },
  { key: 'preset:sora-twilight', label: '🎀 Gothic Black Ribbon', url: soraRibbon },
  { key: 'preset:sora-usagi', label: '🐰 Usagi Plush Sofa', url: soraBunniesSofa },
  { key: 'preset:sora-camellia', label: '💮 White Camellia', url: soraCamellia },
  { key: 'preset:sora-lake', label: '🌅 Okukozome Lake', url: soraTwilightLake },
  { key: 'preset:sora-chibi', label: '✨ Chibi Sora & Usagi', url: soraChibi }
]

export const ANIME_BOARD_TEMPLATES = [
  {
    id: 'sora-okukozome',
    title: 'Okukozome Summer Sky',
    description: 'Serene silver-white & sky-blue workspace inspired by Sora Kasugano in Yosuga no Sora.',
    theme: 'sora-sky',
    badge: '☁️ Distant Sky'
  },
  {
    id: 'sora-moonlit-ribbon',
    title: 'Moonlit Black Ribbon Studio',
    description: 'Gothic monochrome & twilight lavender board featuring Sora’s signature black twin-tail ribbons.',
    theme: 'sora-twilight',
    badge: '🎀 Black Ribbon'
  },
  {
    id: 'sora-usagi-sanctuary',
    title: 'Usagi Plush Bunny Sanctuary',
    description: 'Cozy creative roadmap accompanied by Chibi Sora and her button-eyed patchwork stuffed bunny.',
    theme: 'sora-usagi',
    badge: '🐰 Usagi Plush'
  }
]

export const normalizeThemeKey = (key) => {
  if (key === 'furina') return 'sora-sky'
  if (key === 'nahida') return 'sora-twilight'
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
  if (coverValue === 'preset:sora-sky' || coverValue === 'preset:furina') return soraUsagiBloom
  if (coverValue === 'preset:sora-twilight') return soraRibbon
  if (coverValue === 'preset:sora-usagi' || coverValue === 'preset:nahida') return soraBunniesSofa
  if (coverValue === 'preset:sora-camellia') return soraCamellia
  if (coverValue === 'preset:sora-lake') return soraTwilightLake
  if (coverValue === 'preset:sora-chibi') return soraChibi
  if (coverValue === 'preset:sora-portrait') return soraPortrait
  return coverValue
}

export {
  soraPortrait,
  soraRibbon,
  soraUsagiBloom,
  soraBunniesSofa,
  soraCamellia,
  soraTwilightLake,
  soraChibi
}
