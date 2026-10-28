// Native Web Audio API Synthesizer for "Sora's Music Box (春日野 穹のオルゴール)" & UI Micro-Chimes

let audioCtx = null
let musicBoxInterval = null
let isPlayingMusicBox = false
let noteIndex = 0

// Gentle A-minor / C-major nostalgic music box melody inspired by Yosuga no Sora ("Kioku")
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

    // Soft 2nd harmonic for wind-up music box bell shimmer
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

  // Default gentle single music-box chime
  triggerCelestaNote(ctx, 880.00, 0.45, 0.04, 0)
}

export const isMusicBoxActive = () => isPlayingMusicBox

export const stopSoraMusicBox = () => {
  if (musicBoxInterval) {
    clearInterval(musicBoxInterval)
    musicBoxInterval = null
  }
  isPlayingMusicBox = false
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('chello-musicbox-change', { detail: false }))
  }
}

export const toggleSoraMusicBox = () => {
  if (isPlayingMusicBox) {
    stopSoraMusicBox()
    return false
  }

  const ctx = getAudioContext()
  if (!ctx) return false

  isPlayingMusicBox = true
  noteIndex = 0

  const playNextStep = () => {
    if (!isPlayingMusicBox) return
    const step = MUSIC_BOX_MELODY[noteIndex % MUSIC_BOX_MELODY.length]
    triggerCelestaNote(ctx, step.freq, step.dur, 0.048, 0)
    // Add soft root bass note every 4th beat
    if (noteIndex % 4 === 0) {
      triggerCelestaNote(ctx, step.freq / 2, step.dur * 1.4, 0.028, 0)
    }
    noteIndex++
  }

  playNextStep()
  musicBoxInterval = setInterval(playNextStep, 680)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('chello-musicbox-change', { detail: true }))
  }
  return true
}
