import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { scrollToId, SITE, CONTACT } from './data'
import MusicButton from './MusicButton'
import SfxButton from './SfxButton'

const ITEMS = ['about', 'work', 'stack', 'experience', 'contact']

export default function Nav() {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const bar = useRef(null)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 8)
        const max = document.documentElement.scrollHeight - window.innerHeight
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    const ids = ['home', ...ITEMS]
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    const attach = () => ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    attach()
    const t1 = setTimeout(attach, 1200) // lazy sections mount after the hero
    return () => { io.disconnect(); clearTimeout(t1) }
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    document.documentElement.dataset.menu = open ? '1' : ''
    window.__lenis?.[open ? 'stop' : 'start']?.()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }
  const go = (id) => (e) => { e.preventDefault(); setOpen(false); setTimeout(() => scrollToId(id), open ? 300 : 0) }

  return (
    <>
      <div ref={bar} className="nb-progress" aria-hidden />
      <header className={`nb-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nb-nav__bar">
          <a href="#home" className="nb-brand" onClick={go('home')} aria-label={SITE.name}>
            {i18n.language === 'ar' ? SITE.brandAr : SITE.brandEn}
          </a>
          <nav className="nb-links" aria-label="Primary">
            {ITEMS.map((id) => (
              <a key={id} href={`#${id}`} onClick={go(id)} className={`nb-link${active === id ? ' active' : ''}`}>
                {t(`ed.nav.${id}`)}
              </a>
            ))}
          </nav>
          <div className="nb-tools">
            <MusicButton />
            <SfxButton />
            <button className="nb-pill" onClick={toggleTheme} aria-label="Toggle theme">{isDark ? t('ed.nav.light') : t('ed.nav.dark')}</button>
            <button className="nb-pill" onClick={toggleLang} aria-label="Switch language">{t('lang_label')}</button>
            <button className="nb-pill nb-burger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              {open ? t('ed.nav.close') : t('ed.nav.menu')}
            </button>
          </div>
        </div>
      </header>

      <div className={`nb-sheet${open ? ' open' : ''}`} data-lenis-prevent aria-hidden={!open}>
        <nav>
          {ITEMS.map((id) => (
            <a key={id} href={`#${id}`} onClick={go(id)} tabIndex={open ? 0 : -1}>
              {t(`ed.nav.${id}`)} <span aria-hidden>→</span>
            </a>
          ))}
        </nav>
        <p className="nb-mono">{SITE.location} · {CONTACT.email}</p>
      </div>
    </>
  )
}
