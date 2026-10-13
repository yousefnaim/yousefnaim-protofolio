// UI sound effects (Web Audio, no files): musical bell notes for the name letters,
// soft ticks on hover, pops on click. Audio is unlocked by the first user gesture.

const KEY = 'sfx'
const AC = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null

// A minor pentatonic across two octaves — matches the background loop, so it never sounds off-key
const SCALE = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84]
const mtof = (m) => 440 * 2 ** ((m - 69) / 12)

let ctx = null
let out = null
let enabled = (() => { try { return localStorage.getItem(KEY) !== 'off' } catch { return true } })()
let last = 0

const ensure = () => {
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    const comp = ctx.createDynamicsCompressor()
    out = ctx.createGain()
    out.gain.value = 0.4
    // short echo gives the notes a little space
    const d = ctx.createDelay(0.5)
    d.delayTime.value = 0.18
    const fb = ctx.createGain()
    fb.gain.value = 0.28
    const wet = ctx.createGain()
    wet.gain.value = 0.3
    out.connect(comp)
    out.connect(d)
    d.connect(fb).connect(d)
    d.connect(wet).connect(comp)
    comp.connect(ctx.destination)
  }
  return ctx
}

export const isSfxOn = () => enabled
export function setSfx(on) {
  enabled = on
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch {}
  if (on) { unlock(); pop() }
}
export function unlock() {
  const c = ensure()
  if (c && c.state !== 'running') c.resume().catch(() => {})
}

const ready = (gap = 0.035) => {
  if (!enabled || !ctx || ctx.state !== 'running') return false
  const now = ctx.currentTime
  if (now - last < gap) return false
  last = now
  return true
}

const tone = (freq, { type = 'sine', vol = 0.3, attack = 0.004, decay = 0.5, at = 0 } = {}) => {
  const t = ctx.currentTime + at
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  o.connect(g).connect(out)
  o.start(t)
  o.stop(t + attack + decay + 0.05)
}

/** Bell-like note for the n-th letter/word of the name. */
export function note(n) {
  if (!ready(0.03)) return
  const m = SCALE[((n % SCALE.length) + SCALE.length) % SCALE.length]
  const f = mtof(m)
  tone(f, { vol: 0.32, decay: 0.9 })
  tone(f * 2, { type: 'triangle', vol: 0.1, decay: 0.45 })
  tone(f * 3.01, { vol: 0.05, decay: 0.25 })
}

/** Tiny soft tick for hovering controls; pitch varies a little. */
export function tick(seed = 0) {
  if (!ready(0.06)) return
  const m = SCALE[(seed * 3 + 5) % SCALE.length] + 12
  tone(mtof(m), { vol: 0.12, attack: 0.002, decay: 0.09 })
}

/** Cards / bigger blocks: a lower wooden pluck. */
export function thud(seed = 0) {
  if (!ready(0.08)) return
  const m = SCALE[seed % 5]
  tone(mtof(m), { type: 'triangle', vol: 0.26, attack: 0.003, decay: 0.22 })
  tone(mtof(m) * 2, { vol: 0.08, decay: 0.12 })
}

/** Click: two quick rising notes. */
export function pop() {
  if (!ready(0.05)) return
  tone(mtof(72), { type: 'triangle', vol: 0.22, decay: 0.14 })
  tone(mtof(79), { type: 'triangle', vol: 0.22, decay: 0.2, at: 0.06 })
}

const BTN = '.nb-btn, .nb-pill, .nb-link, .nb-brand, .nb-card__go, .nb-sheet a, .nb-top, .nb-plus, .nb-exp__btn'
const BLOCK = '.nb-card, .nb-stat, .nb-what li, .nb-stack__col li, .nb-stack__tools span, .nb-big-stat, .nb-meta li, .nb-mail, .nb-exp__item'
const LETTER = '.nb-ch, .nb-wd'

/** Delegated listeners for the whole page. Returns a cleanup function. */
export function attachSfx(root = document) {
  let seed = 0
  const onOver = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    const t = e.target instanceof Element ? e.target : null
    if (!t) return
    const hit = (sel) => {
      const el = t.closest(sel)
      return el && !el.contains(e.relatedTarget) ? el : null
    }
    const letter = hit(LETTER)
    if (letter) return note(Number(letter.dataset.n || 0))
    if (hit(BTN)) return tick(seed++)
    if (hit(BLOCK)) return thud(seed++)
  }
  const onDown = (e) => {
    unlock()
    const t = e.target instanceof Element ? e.target : null
    if (t?.closest(`${BTN}, .nb-card`)) pop()
    else if (t?.closest(LETTER)) note(Number(t.closest(LETTER).dataset.n || 0))
  }
  root.addEventListener('pointerover', onOver, { passive: true })
  root.addEventListener('pointerdown', onDown, { passive: true })
  root.addEventListener('keydown', unlock, { passive: true })
  return () => {
    root.removeEventListener('pointerover', onOver)
    root.removeEventListener('pointerdown', onDown)
    root.removeEventListener('keydown', unlock)
  }
}
