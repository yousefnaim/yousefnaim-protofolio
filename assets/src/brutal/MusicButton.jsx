import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createAmbient } from './ambient'

const KEY = 'music'
const read = () => { try { return localStorage.getItem(KEY) === 'on' } catch { return false } }
const write = (v) => { try { localStorage.setItem(KEY, v ? 'on' : 'off') } catch {} }

export default function MusicButton() {
  const { t } = useTranslation()
  const engine = useRef(null)
  const [on, setOn] = useState(false)

  const get = () => (engine.current ??= createAmbient())

  const play = useCallback(async () => {
    try { await get().start(); setOn(true); write(true) } catch { setOn(false) }
  }, [])
  const pause = useCallback(() => { get().stop(); setOn(false); write(false) }, [])

  // Browsers block audio until a gesture: if the visitor left music on last time,
  // resume on their first interaction with the page.
  useEffect(() => {
    if (!read()) return
    const go = () => { play(); off() }
    const off = () => ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, go))
    ;['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, go, { once: true, passive: true }))
    return off
  }, [play])

  useEffect(() => {
    const onVis = () => (document.hidden ? engine.current?.hide() : engine.current?.show())
    document.addEventListener('visibilitychange', onVis)
    return () => { document.removeEventListener('visibilitychange', onVis); engine.current?.stop() }
  }, [])

  return (
    <button
      className={`nb-pill nb-music${on ? ' on' : ''}`}
      onClick={on ? pause : play}
      aria-pressed={on}
      aria-label={on ? t('ed.nav.music_off') : t('ed.nav.music_on')}
      title={on ? t('ed.nav.music_off') : t('ed.nav.music_on')}
    >
      <span className="nb-eq" aria-hidden><i /><i /><i /><i /></span>
      <span className="nb-music__label">{t('ed.nav.music')}</span>
    </button>
  )
}
