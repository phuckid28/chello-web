import furinaHero from '~/assets/anime/furina-hero.jpg'
import nahidaHero from '~/assets/anime/nahida-hero.jpg'

const PERSONA_STORAGE_KEY = 'chello_persona_theme'

export const ANIME_THEMES = {
  furina: {
    id: 'furina',
    name: 'Furina • Salon Solitaire',
    jpTitle: 'サロン・ソリテール • Fontaine Opera',
    element: 'Hydro',
    characterName: 'Lady Furina de Fontaine',
    quote: '“Let the world come alive! Every quest on this stage deserves a standing ovation!”',
    heroImage: furinaHero,
    accentColor: '#38bdf8',
    secondaryAccent: '#fbbf24',
    badgeBg: 'rgba(56, 189, 248, 0.22)',
    appBarBgLight: 'linear-gradient(135deg, #0b192c 0%, #1e3a8a 50%, #1d4ed8 100%)',
    appBarBgDark: 'linear-gradient(135deg, #060d1a 0%, #0f172a 50%, #1e3a8a 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(15, 23, 42, 0.86) 0%, rgba(30, 58, 138, 0.82) 55%, rgba(29, 78, 216, 0.80) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(6, 13, 26, 0.90) 0%, rgba(15, 23, 42, 0.86) 60%, rgba(30, 58, 138, 0.84) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(11, 25, 44, 0.58) 0%, rgba(15, 23, 42, 0.72) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(6, 13, 26, 0.72) 0%, rgba(15, 23, 42, 0.86) 100%)',
    columnBgLight: 'rgba(241, 245, 249, 0.88)',
    columnBgDark: 'rgba(15, 23, 42, 0.84)',
    columnBorder: 'rgba(56, 189, 248, 0.35)',
    particleSymbols: ['💧', '✦', '🫧', '✧', '🎭']
  },
  nahida: {
    id: 'nahida',
    name: 'Nahida • Akasha Sanctuary',
    jpTitle: 'スラサタンナ聖処 • Irminsul Wisdom',
    element: 'Dendro',
    characterName: 'Lesser Lord Kusanali (Nahida)',
    quote: '“Every leaf in Irminsul remembers your footsteps. May wisdom guide your work today!”',
    heroImage: nahidaHero,
    accentColor: '#34d399',
    secondaryAccent: '#fde047',
    badgeBg: 'rgba(52, 211, 153, 0.22)',
    appBarBgLight: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
    appBarBgDark: 'linear-gradient(135deg, #022c22 0%, #064e3b 55%, #047857 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(6, 78, 59, 0.86) 0%, rgba(4, 120, 87, 0.82) 55%, rgba(5, 150, 105, 0.80) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(2, 44, 34, 0.90) 0%, rgba(6, 78, 59, 0.86) 60%, rgba(4, 120, 87, 0.84) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(2, 44, 34, 0.54) 0%, rgba(6, 78, 59, 0.72) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(2, 44, 34, 0.72) 0%, rgba(6, 78, 59, 0.86) 100%)',
    columnBgLight: 'rgba(236, 253, 245, 0.88)',
    columnBgDark: 'rgba(6, 46, 36, 0.84)',
    columnBorder: 'rgba(52, 211, 153, 0.35)',
    particleSymbols: ['🌿', '✦', '🍀', '✧', '🌱']
  },
  celestia: {
    id: 'celestia',
    name: 'Celestia • Dual Archon Resonance',
    jpTitle: 'セレスティア • Hydro & Dendro Bloom',
    element: 'Bloom',
    characterName: 'Furina & Nahida Resonance',
    quote: '“Where Fontaine’s dramatic waters meet Sumeru’s boundless wisdom, masterpieces bloom!”',
    heroImage: furinaHero,
    accentColor: '#c084fc',
    secondaryAccent: '#38bdf8',
    badgeBg: 'rgba(192, 132, 252, 0.22)',
    appBarBgLight: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #047857 100%)',
    appBarBgDark: 'linear-gradient(135deg, #0f0e26 0%, #172554 50%, #064e3b 100%)',
    boardBarBgLight: 'linear-gradient(135deg, rgba(30, 27, 75, 0.86) 0%, rgba(30, 58, 138, 0.82) 55%, rgba(4, 120, 87, 0.80) 100%)',
    boardBarBgDark: 'linear-gradient(135deg, rgba(15, 14, 38, 0.90) 0%, rgba(23, 37, 84, 0.86) 60%, rgba(6, 78, 59, 0.84) 100%)',
    boardOverlayLight: 'linear-gradient(180deg, rgba(15, 23, 42, 0.58) 0%, rgba(6, 78, 59, 0.72) 100%)',
    boardOverlayDark: 'linear-gradient(180deg, rgba(15, 14, 38, 0.74) 0%, rgba(6, 78, 59, 0.86) 100%)',
    columnBgLight: 'rgba(243, 244, 246, 0.88)',
    columnBgDark: 'rgba(17, 24, 39, 0.84)',
    columnBorder: 'rgba(192, 132, 252, 0.35)',
    particleSymbols: ['💧', '🌿', '✦', '🫧', '🍀']
  }
}

export const ELEMENTAL_LABELS = [
  { id: 'hydro', title: '💧 Hydro • Spotlight', color: '#0284c7' },
  { id: 'dendro', title: '🌿 Dendro • Wisdom', color: '#059669' },
  { id: 'pyro', title: '🔥 Pyro • Urgent Hotfix', color: '#dc2626' },
  { id: 'electro', title: '⚡ Electro • Sprint', color: '#7c3aed' },
  { id: 'cryo', title: '❄️ Cryo • Research', color: '#0891b2' },
  { id: 'geo', title: '💎 Geo • Core System', color: '#d97706' },
  { id: 'anemo', title: '🍃 Anemo • UI/UX Polish', color: '#0d9488' }
]

export const ANIME_BOARD_TEMPLATES = [
  {
    id: 'furina-opera',
    title: 'Fontaine Opera Epiclese',
    description: 'Theatrical sprint board inspired by Lady Furina & Salon Solitaire with Hydro spotlight tasks.',
    theme: 'furina',
    badge: '💧 Hydro Archon'
  },
  {
    id: 'nahida-akasha',
    title: 'Akasha Research Sanctuary',
    description: 'Knowledge base & research workflow guided by Nahida & Irminsul wisdom.',
    theme: 'nahida',
    badge: '🌿 Dendro Archon'
  },
  {
    id: 'celestia-bloom',
    title: 'Otaku Indie Studio Sprint',
    description: 'Full-stack anime & game development roadmap combining Hydro elegance and Dendro clarity.',
    theme: 'celestia',
    badge: '✨ Dual Archon'
  }
]

export const getSavedPersonaTheme = () => {
  try {
    const saved = localStorage.getItem(PERSONA_STORAGE_KEY)
    return ANIME_THEMES[saved] ? saved : 'furina'
  } catch (error) {
    return 'furina'
  }
}

export const savePersonaTheme = (themeKey) => {
  try {
    if (ANIME_THEMES[themeKey]) {
      localStorage.setItem(PERSONA_STORAGE_KEY, themeKey)
      window.dispatchEvent(new CustomEvent('chello-persona-change', { detail: themeKey }))
    }
  } catch (error) {
    // Ignore localStorage errors
  }
}

export const resolveCardCoverUrl = (coverValue) => {
  if (!coverValue) return null
  if (coverValue === 'preset:furina') return furinaHero
  if (coverValue === 'preset:nahida') return nahidaHero
  return coverValue
}

export { furinaHero, nahidaHero }
