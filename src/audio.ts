const NOTE_FREQ: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
}

let audioContext: AudioContext | null = null

export function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioContext = new Ctor()
  }
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

export interface MelodyNote {
  note: string
  beats?: number
}

export interface Playback {
  stop: () => void
  duration: number
}

export function playMelody(
  notes: MelodyNote[],
  options: { beat?: number; volume?: number; type?: OscillatorType; octaveShift?: number } = {},
): Playback {
  const ctx = getAudioContext()
  if (!ctx) return { stop: () => undefined, duration: 0 }
  const beat = options.beat ?? 0.42
  const volume = options.volume ?? 0.08
  const wave = options.type ?? 'sine'
  const startAt = ctx.currentTime + 0.04
  const master = ctx.createGain()
  master.gain.setValueAtTime(volume, startAt)
  master.connect(ctx.destination)
  const oscillators: OscillatorNode[] = []
  let cursor = 0

  for (const item of notes) {
    const freq = NOTE_FREQ[item.note] * (options.octaveShift ? 2 ** options.octaveShift : 1)
    if (!freq) continue
    const duration = (item.beats ?? 1) * beat
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(freq, startAt + cursor)
    gain.gain.setValueAtTime(0.0001, startAt + cursor)
    gain.gain.exponentialRampToValueAtTime(1, startAt + cursor + 0.035)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + cursor + Math.max(0.08, duration - 0.06))
    osc.connect(gain)
    gain.connect(master)
    osc.start(startAt + cursor)
    osc.stop(startAt + cursor + duration + 0.05)
    oscillators.push(osc)
    cursor += duration
  }

  const stop = () => {
    try {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(0.0001, ctx.currentTime)
      oscillators.forEach((osc) => {
        try {
          osc.stop()
        } catch {
          /* already stopped */
        }
      })
      master.disconnect()
    } catch {
      /* noop */
    }
  }

  return { stop, duration: cursor * 1000 }
}
