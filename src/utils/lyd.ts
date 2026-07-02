import { SK } from './storage-keys'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export function lydErPaa(): boolean {
  return localStorage.getItem(SK.sound) !== 'off'
}

export function spillFullfortLyd(): void {
  if (!lydErPaa()) return

  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return

  const ctx = new AudioCtx()

  try {
    // Oppadgående arpeggio: C5 – E5 – G5 – C6
    const noter    = [523.25, 659.25, 783.99, 1046.50]
    const startTid = ctx.currentTime

    noter.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTid + i * 0.12)

      gain.gain.setValueAtTime(0, startTid + i * 0.12)
      gain.gain.linearRampToValueAtTime(0.28, startTid + i * 0.12 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startTid + i * 0.12 + 0.25)

      osc.start(startTid + i * 0.12)
      osc.stop(startTid  + i * 0.12 + 0.28)
    })

    setTimeout(() => ctx.close(), noter.length * 120 + 400)
  } catch (err) {
    ctx.close()
    console.warn('Lyd feilet:', err)
  }
}
