import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isSfxOn, setSfx } from './sfx'

export default function SfxButton() {
  const { t } = useTranslation()
  const [on, setOn] = useState(isSfxOn)
  const toggle = () => { const v = !on; setSfx(v); setOn(v) }

  return (
    <button
      className={`nb-pill nb-sfx${on ? ' on' : ''}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? t('ed.nav.sfx_off') : t('ed.nav.sfx_on')}
      title={on ? t('ed.nav.sfx_off') : t('ed.nav.sfx_on')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
        {on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
      </svg>
    </button>
  )
}
