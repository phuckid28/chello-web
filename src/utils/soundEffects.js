// Multi-Character Anime OST Audio Streamer (Sora / Furina / Nahida) + Web Audio Music Box Synthesizer & UI Micro-Chimes

let audioCtx = null
let musicBoxInterval = null
let htmlAudioElement = null
let isPlayingMusicBox = false
let currentTrackId = 'sora-toui-sora-e'
let customLocalTrackUrl = null
let customLocalTrackName = null
let noteIndex = 0

export const OST_TRACK_CATALOG = [
  {
    id: 'sora-toui-sora-e',
    character: 'sora',
    title: 'Toui Sora e (遠い空へ — Main Theme)',
    subtitle: 'Yosuga no Sora OST • Manabu Miwa (Bruno Wen-li)',
    url: 'https://archive.org/download/yosuga-no-sora_202502/Yosuga%20no%20Sora%20OST/%E4%B8%89%E8%BC%AA%E5%AD%A6%20-%20Bruno%20Wen-li%20-%20%E3%83%A8%E3%82%B9%E3%82%AC%E3%83%8E%E3%82%BD%E3%83%A9%20%E4%BE%9D%E5%AA%9B%E5%A5%88%E7%B7%92-%20%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB%E3%82%B5%E3%82%A6%E3%83%B3%E3%83%89%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%20-New-%20%5BBonus%20Disc%5D/01%20-%E3%83%A8%E3%82%B9%E3%82%AC%E3%83%8E%E3%82%BD%E3%83%A9%E3%80%80%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%86%E3%83%BC%E3%83%9E%E3%80%80%E2%80%95%E9%81%A0%E3%81%84%E7%A9%BA%E3%81%B8%E2%80%95.mp3'
  },
  {
    id: 'sora-inori',
    character: 'sora',
    title: 'Inori (祈り — Prayer)',
    subtitle: 'Yosuga no Sora OST • Manabu Miwa (Bruno Wen-li)',
    url: 'https://archive.org/download/yosuga-no-sora_202502/Yosuga%20no%20Sora%20OST/%E4%B8%89%E8%BC%AA%E5%AD%A6%20-%20Bruno%20Wen-li%20-%20%E3%83%A8%E3%82%B9%E3%82%AC%E3%83%8E%E3%82%BD%E3%83%A9%20%E4%BE%9D%E5%AA%9B%E5%A5%88%E7%B7%92-%20%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB%E3%82%B5%E3%82%A6%E3%83%B3%E3%83%89%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%20-New-%20%5BBonus%20Disc%5D/02%20-%E3%83%A8%E3%82%B9%E3%82%AC%E3%83%8E%E3%82%BD%E3%83%A9%E3%80%80%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%86%E3%83%BC%E3%83%9E%E3%80%80%E2%80%95%E7%A5%88%E3%82%8A%E2%80%95.mp3'
  },
  {
    id: 'sora-tomadoi',
    character: 'sora',
    title: 'Tomadoi no Naka (戸惑いの中)',
    subtitle: 'Yosuga no Sora OST • Manabu Miwa (Bruno Wen-li)',
    url: 'https://archive.org/download/yosuga-no-sora_202502/Yosuga%20no%20Sora%20OST/%E4%B8%89%E8%BC%AA%E5%AD%A6%20-%20Bruno%20Wen-li%20-%20%E3%83%A8%E3%82%B9%E3%82%AC%E3%83%8E%E3%82%BD%E3%83%A9%20%E4%BE%9D%E5%AA%9B%E5%A5%88%E7%B7%92-%20%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB%E3%82%B5%E3%82%A6%E3%83%B3%E3%83%89%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%20-New-%20%5BBonus%20Disc%5D/16%20-%E6%88%B8%E6%83%91%E3%81%84%E3%81%AE%E4%B8%AD.mp3'
  },
  {
    id: 'sora-kioku',
    character: 'sora',
    title: 'Kioku (記憶 — Memory)',
    subtitle: 'Yosuga no Sora OST • Manabu Miwa (Bruno Wen-li)',
    url: 'https://archive.org/download/yosuga-no-sora_202502/Yosuga%20no%20Sora%20OST/%E4%B8%89%E8%BC%AA%E5%AD%A6%20-%20Bruno%20Wen-li%20-%20%E3%83%A8%E3%82%B9%E3%82%AC%E3%83%8E%E3%82%BD%E3%83%A9%20%E4%BE%9D%E5%AA%9B%E5%A5%88%E7%B7%92-%20%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB%E3%82%B5%E3%82%A6%E3%83%B3%E3%83%89%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%20-New-%20%5BBonus%20Disc%5D/05%20-%E3%83%A8%E3%82%B9%E3%82%AC%E3%83%8E%E3%82%BD%E3%83%A9%E3%80%80%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%86%E3%83%BC%E3%83%9E%E3%80%80%E2%80%95%E8%A8%98%E6%86%B6%E2%80%95.mp3'
  },
  {
    id: 'furina-sinners-finale',
    character: 'furina',
    title: 'Sinner’s Finale (The Last Rose of the Sinner)',
    subtitle: 'Genshin Impact • Fontaine OST (HOYO-MiX)',
    url: 'https://archive.org/download/1-11-narcissus-without-water/1-25%20The%20Last%20Rose%20of%20the%20Sinner.mp3'
  },
  {
    id: 'furina-fontaine-lobby',
    character: 'furina',
    title: 'Fontaine Main Theme (Fountain of Belleau)',
    subtitle: 'Genshin Impact • Fontaine Symphony (HOYO-MiX)',
    url: 'https://archive.org/download/1-01-fontaine/1-01%20Fontaine.mp3'
  },
  {
    id: 'nahida-sumeru-main',
    character: 'nahida',
    title: 'Sumeru Main Theme (Forest of Jnana & Vidya)',
    subtitle: 'Genshin Impact • Sumeru OST (HOYO-MiX)',
    url: 'https://archive.org/download/1-01-sumeru/1-01%20Sumeru.mp3'
  },
  {
    id: 'nahida-whirling-leaves',
    character: 'nahida',
    title: 'Whirling of Leaves and Petals',
    subtitle: 'Genshin Impact • Sanctuary of Surasthana (HOYO-MiX)',
    url: 'https://archive.org/download/1-01-sumeru/1-02%20Whirling%20of%20Leaves%20and%20Petals.mp3'
  },
  {
    id: 'synth-music-box',
    character: 'synth',
    title: 'Music Box Synthesizer (Offline Celesta)',
    subtitle: 'Built-in Web Audio API • Zero-latency Melody',
    url: null
  }
]

// Gentle A-minor / C-major nostalgic music box melody for offline fallback
const MUSIC_BOX_MELODY = [
  { freq: 659.25, dur: 0.9 }, // E5
  { freq: 783.99, dur: 0.9 }, // G5
  { freq: 880.00, dur: 1.2 }, // A5
  { freq: 783.99, dur: 0.9 }, // G5
  { freq: 659.25, dur: 0.9 }, // E5
  { freq: 587.33, dur: 1.1 }, // D5
  { freq: 523.25, dur: 1.2 }, // C5
  { freq: 587.33, dur: 0.9 }, // D5
  { freq: 659.25, dur: 1.4 }, // E5
  { freq: 440.00, dur: 1.4 }, // A4
  { freq: 523.25, dur: 0.9 }, // C5
  { freq: 587.33, dur: 0.9 }, // D5
  { freq: 659.25, dur: 1.2 }, // E5
  { freq: 587.33, dur: 0.9 }, // D5
  { freq: 523.25, dur: 0.9 }, // C5
  { freq: 493.88, dur: 1.4 } // B4
]

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

const triggerCelestaNote = (ctx, freq, duration = 0.8, volume = 0.06, delaySec = 0) => {
  try {
    const startTime = ctx.currentTime + delaySec
    const osc = ctx.createOscillator()
    const overtone = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)

    overtone.type = 'triangle'
    overtone.frequency.setValueAtTime(freq * 2, startTime)

    const overtoneGain = ctx.createGain()
    overtoneGain.gain.setValueAtTime(volume * 0.22, startTime)
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6)

    gain.gain.setValueAtTime(0.001, startTime)
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    osc.connect(gain)
    overtone.connect(overtoneGain)
    overtoneGain.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    overtone.start(startTime)
    osc.stop(startTime + duration + 0.05)
    overtone.stop(startTime + duration + 0.05)
  } catch (error) {
    // Ignore audio context errors when autoplay is blocked
  }
}

export const playUiChime = (type = 'sparkle') => {
  const ctx = getAudioContext()
  if (!ctx) return

  if (type === 'complete') {
    triggerCelestaNote(ctx, 523.25, 0.45, 0.05, 0)
    triggerCelestaNote(ctx, 659.25, 0.45, 0.05, 0.09)
    triggerCelestaNote(ctx, 783.99, 0.55, 0.06, 0.18)
    triggerCelestaNote(ctx, 1046.50, 0.85, 0.06, 0.28)
    return
  }

  if (type === 'theme') {
    triggerCelestaNote(ctx, 659.25, 0.5, 0.045, 0)
    triggerCelestaNote(ctx, 880.00, 0.7, 0.05, 0.12)
    return
  }

  triggerCelestaNote(ctx, 880.00, 0.45, 0.04, 0)
}

export const getDefaultTrackForTheme = (themeKey) => {
  if (themeKey === 'furina') return 'furina-sinners-finale'
  if (themeKey === 'nahida') return 'nahida-sumeru-main'
  if (themeKey === 'sora-twilight') return 'sora-inori'
  if (themeKey === 'sora-usagi') return 'sora-tomadoi'
  return 'sora-toui-sora-e'
}

export const getCurrentTrackInfo = () => {
  if (currentTrackId === 'custom-local' && customLocalTrackUrl) {
    return {
      id: 'custom-local',
      character: 'custom',
      title: customLocalTrackName || 'Custom Local Audio',
      subtitle: 'Local Audio File',
      url: customLocalTrackUrl
    }
  }
  return OST_TRACK_CATALOG.find(t => t.id === currentTrackId) || OST_TRACK_CATALOG[0]
}

export const isMusicBoxActive = () => isPlayingMusicBox

const emitAudioState = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('chello-musicbox-change', {
      detail: {
        isPlaying: isPlayingMusicBox,
        track: getCurrentTrackInfo()
      }
    }))
  }
}

const startSynthFallback = () => {
  if (musicBoxInterval) {
    clearInterval(musicBoxInterval)
    musicBoxInterval = null
  }
  const ctx = getAudioContext()
  if (!ctx) return

  noteIndex = 0
  const playNextStep = () => {
    if (!isPlayingMusicBox) return
    const step = MUSIC_BOX_MELODY[noteIndex % MUSIC_BOX_MELODY.length]
    triggerCelestaNote(ctx, step.freq, step.dur, 0.048, 0)
    if (noteIndex % 4 === 0) {
      triggerCelestaNote(ctx, step.freq / 2, step.dur * 1.4, 0.028, 0)
    }
    noteIndex++
  }

  playNextStep()
  musicBoxInterval = setInterval(playNextStep, 680)
}

export const stopSoraMusicBox = () => {
  if (musicBoxInterval) {
    clearInterval(musicBoxInterval)
    musicBoxInterval = null
  }
  if (htmlAudioElement) {
    try {
      htmlAudioElement.pause()
    } catch (e) {
      // Ignore pause errors
    }
  }
  isPlayingMusicBox = false
  emitAudioState()
}

export const playOstTrack = (trackId) => {
  if (trackId) {
    currentTrackId = trackId
  }
  const track = getCurrentTrackInfo()

  if (musicBoxInterval) {
    clearInterval(musicBoxInterval)
    musicBoxInterval = null
  }
  if (htmlAudioElement) {
    try {
      htmlAudioElement.pause()
    } catch (e) {
      // Ignore
    }
  }

  isPlayingMusicBox = true

  if (!track.url || track.id === 'synth-music-box') {
    startSynthFallback()
    emitAudioState()
    return true
  }

  try {
    if (!htmlAudioElement) {
      htmlAudioElement = new Audio()
      htmlAudioElement.loop = true
      htmlAudioElement.volume = 0.42
    }
    htmlAudioElement.src = track.url
    const playPromise = htmlAudioElement.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If remote stream is blocked or offline, seamlessly fall back to celesta synthesizer
        if (isPlayingMusicBox) {
          startSynthFallback()
        }
      })
    }
  } catch (err) {
    startSynthFallback()
  }

  emitAudioState()
  return true
}

export const playCustomAudioFile = (file) => {
  if (!file) return false
  if (customLocalTrackUrl) {
    URL.revokeObjectURL(customLocalTrackUrl)
  }
  customLocalTrackUrl = URL.createObjectURL(file)
  customLocalTrackName = file.name.replace(/\.[^/.]+$/, '')
  return playOstTrack('custom-local')
}

export const toggleSoraMusicBox = (preferredThemeKey) => {
  if (isPlayingMusicBox) {
    stopSoraMusicBox()
    return false
  }
  if (preferredThemeKey && currentTrackId === 'sora-toui-sora-e') {
    currentTrackId = getDefaultTrackForTheme(preferredThemeKey)
  }
  return playOstTrack(currentTrackId)
}
