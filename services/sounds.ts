import type { GameSfx } from '../types/game'

let ctx: AudioContext | null = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export async function unlockAudio() {
  const audioCtx = getCtx()
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume()
  }
}

export function playSfx(type: GameSfx, muted: boolean) {
  if (muted) return
  const audioCtx = getCtx()
  if (audioCtx.state !== 'running') return
  const oscillator = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  const freqMap: Record<GameSfx, number> = {
    play: 410,
    draw: 260,
    win: 720,
    lose: 180,
  }
  oscillator.type = 'triangle'
  oscillator.frequency.value = freqMap[type]
  gain.gain.setValueAtTime(0.001, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18)
  oscillator.connect(gain)
  gain.connect(audioCtx.destination)
  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.2)
}
