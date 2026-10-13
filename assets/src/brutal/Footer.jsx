import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT, SITE } from './data'

const fmt = () =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: SITE.timeZone }).format(new Date())

export default function Footer() {
  const { t } = useTranslation()
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 20000)
    return () => clearInterval(id)
  }, [])
  const up = () => (window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: 'smooth' }))

  return (
    <footer className="nb-footer nb-mono">
      <div className="nb-wrap nb-footer__in">
        <span>{t('ed.footer.rights', { year: new Date().getFullYear() })}</span>
        <span>{t('ed.footer.local')} · <span dir="ltr">{time}</span> · {SITE.city}</span>
        <span className="nb-social">
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
          <a href={CONTACT.gmail} target="_blank" rel="noopener noreferrer">Gmail ↗</a>
        </span>
        <button className="nb-top" onClick={up}>{t('ed.footer.top')} ↑</button>
      </div>
    </footer>
  )
}
