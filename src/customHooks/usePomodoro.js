import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { playUiChime } from '~/utils/soundEffects'

// Simple Pomodoro countdown; `durationSeconds` is the length of the current session
export const usePomodoro = (defaultSeconds) => {
  const [durationSeconds, setDurationSeconds] = useState(defaultSeconds)
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return undefined
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) return prev - 1
        setIsRunning(false)
        playUiChime('complete')
        toast.success('Pomodoro ✓')
        return durationSeconds
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, durationSeconds])

  const reset = (seconds) => {
    setIsRunning(false)
    setDurationSeconds(seconds)
    setSecondsLeft(seconds)
  }

  return { secondsLeft, durationSeconds, isRunning, setIsRunning, reset }
}

export const formatTimer = (totalSec) => {
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const s = String(totalSec % 60).padStart(2, '0')
  return `${m}:${s}`
}
