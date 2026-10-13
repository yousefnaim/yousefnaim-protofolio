// Energetic synthwave / house loop built with the Web Audio API — no audio files.
// 124 BPM · four-on-the-floor kick, off-beat hats, claps, driving bass, arpeggio and chord stabs
// over Am → F → C → G.

const mtof = (m) => 440 * 2 ** ((m - 69) / 12)

const BPM = 124
const STEP = 60 / BPM / 4 // 16th note
const ROOTS = [45, 41, 48, 43] // A2 F2 C3 G2
const CHORDS = [
  [57, 60, 64, 69], // Am
  [53, 57, 60, 65], // F
  [60, 64, 67, 72], // C
  [55, 59, 62, 67], // G
]
const ARP = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 3, 1, 2]
const BASS_STEPS = new Set([0, 3, 6, 8, 11, 14])

export function createAmbient() {
  let ctx = null
  let master = null
  let bus = null
  let noise = null
  let timer = null
  let nextTime = 0
  let step = 0
  let playing = false

  const init = () => {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = 0
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -16
    comp.ratio.value = 4
    comp.attack.value = 0.005
    comp.release.value = 0.15
    bus = ctx.createGain()
    bus.connect(comp).connect(master).connect(ctx.destination)

    // dotted-eighth echo for the arp
    const delay = ctx.createDelay(1)
    delay.delayTime.value = STEP * 3
    const fb = ctx.createGain()
    fb.gain.value = 0.32
    const echo = ctx.createGain()
    echo.gain.value = 0.28
    delay.connect(fb).connect(delay)
    delay.connect(echo).connect(bus)
    bus.echo = delay

    const len = ctx.sampleRate
    noise = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  }

  const kick = (t) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(150, t)
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12)
    g.gain.setValueAtTime(1, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.34)
    o.connect(g).connect(bus)
    o.start(t)
    o.stop(t + 0.36)
  }

  const noiseHit = (t, { freq, type, vol, dur }) => {
    const s = ctx.createBufferSource()
    s.buffer = noise
    const f = ctx.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    s.connect(f).connect(g).connect(bus)
    s.start(t)
    s.stop(t + dur + 0.02)
  }
  const hat = (t, open) => noiseHit(t, { freq: 7500, type: 'highpass', vol: open ? 0.22 : 0.12, dur: open ? 0.16 : 0.045 })
  const clap = (t) => {
    noiseHit(t, { freq: 1800, type: 'bandpass', vol: 0.55, dur: 0.16 })
    noiseHit(t + 0.012, { freq: 1500, type: 'bandpass', vol: 0.3, dur: 0.12 })
  }

  const bass = (midi, t) => {
    const o = ctx.createOscillator()
    const f = ctx.createBiquadFilter()
    const g = ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.value = mtof(midi)
    f.type = 'lowpass'
    f.Q.value = 6
    f.frequency.setValueAtTime(1100, t)
    f.frequency.exponentialRampToValueAtTime(180, t + STEP * 1.8)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(0.5, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + STEP * 2.2)
    o.connect(f).connect(g).connect(bus)
    o.start(t)
    o.stop(t + STEP * 2.3)
  }

  const lead = (midi, t, accent) => {
    const o = ctx.createOscillator()
    const f = ctx.createBiquadFilter()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.value = mtof(midi)
    f.type = 'lowpass'
    f.frequency.value = accent ? 3600 : 2200
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(accent ? 0.13 : 0.085, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.001, t + STEP * 1.6)
    o.connect(f).connect(g)
    g.connect(bus)
    g.connect(bus.echo)
    o.start(t)
    o.stop(t + STEP * 1.7)
  }

  const stab = (chord, t) => {
    chord.forEach((m) => {
      const o = ctx.createOscillator()
      const f = ctx.createBiquadFilter()
      const g = ctx.createGain()
      o.type = 'sawtooth'
      o.frequency.value = mtof(m)
      o.detune.value = (Math.random() - 0.5) * 14
      f.type = 'lowpass'
      f.frequency.value = 2400
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(0.06, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.001, t + STEP * 2.6)
      o.connect(f).connect(g).connect(bus)
      o.start(t)
      o.stop(t + STEP * 2.7)
    })
  }

  const schedule = () => {
    while (nextTime < ctx.currentTime + 0.35) {
      const bar = Math.floor(step / 16) % 4
      const s = step % 16
      const t = nextTime

      if (s % 4 === 0) kick(t)
      if (s % 4 === 2) hat(t, true)
      else if (s % 2 === 1) hat(t, false)
      if (s === 4 || s === 12) clap(t)
      if (BASS_STEPS.has(s)) bass(ROOTS[bar] + (s === 14 ? 12 : 0), t)
      const arpNote = CHORDS[bar][ARP[s]] + (s >= 8 && s % 4 === 3 ? 12 : 0)
      lead(arpNote, t, s % 4 === 0)
      if (s === 0 || s === 6 || s === 10) stab(CHORDS[bar], t)

      nextTime += STEP
      step++
    }
  }

  return {
    get playing() { return playing },
    async start() {
      if (playing) return
      if (!ctx) init()
      await ctx.resume()
      playing = true
      step = 0
      nextTime = ctx.currentTime + 0.1
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2)
      clearInterval(timer)
      timer = setInterval(schedule, 80)
      schedule()
    },
    stop() {
      if (!playing || !ctx) return
      playing = false
      clearInterval(timer)
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
      setTimeout(() => { if (!playing) ctx.suspend() }, 800)
    },
    // pause while the tab is hidden without changing the user's choice
    hide() { if (playing && ctx) ctx.suspend() },
    show() { if (playing && ctx) ctx.resume() },
  }
}
