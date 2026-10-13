import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SectionHead } from './About'
import { pad, useProjects } from './data'

const TINTS = ['var(--nb-yellow)', 'var(--nb-pink)', 'var(--nb-green)', 'var(--nb-lilac)', 'var(--nb-orange)', 'var(--nb-yellow)']

function Case({ projects, index, onClose, onGo }) {
  const { t } = useTranslation()
  const p = projects[index]
  const next = projects[(index + 1) % projects.length]
  const prev = projects[(index - 1 + projects.length) % projects.length]
  const rtl = document.dir === 'rtl'
  const scroller = useRef(null)
  const closeBtn = useRef(null)

  useEffect(() => {
    const prev = document.activeElement
    window.__lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    closeBtn.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const d = (e.key === 'ArrowRight') === (document.dir !== 'rtl') ? 1 : -1
        onGo((index + d + projects.length) % projects.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.__lenis?.start()
      document.documentElement.style.overflow = ''
      prev?.focus?.()
    }
  }, [onClose, onGo, index, projects.length])

  useEffect(() => { scroller.current?.scrollTo(0, 0) }, [index])

  return (
    <motion.div
      className="nb-case" data-lenis-prevent role="dialog" aria-modal="true" aria-label={p.title} ref={scroller}
      initial={{ y: '100%', rotate: 1.5 }} animate={{ y: 0, rotate: 0 }} exit={{ y: '100%', rotate: -1.5 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <div className="nb-case__bar nb-mono">
        <span dir="ltr">{pad(index + 1)} / {pad(projects.length)}</span>
        <div className="nb-tools">
          <button className="nb-pill" onClick={() => onGo((index - 1 + projects.length) % projects.length)} title={prev.title} aria-label={`${t('ed.work.prev')}: ${prev.title}`}>
            {rtl ? '→' : '←'} {t('ed.work.prev')}
          </button>
          <button className="nb-pill" onClick={() => onGo((index + 1) % projects.length)} title={next.title} aria-label={`${t('ed.work.next')}: ${next.title}`}>
            {t('ed.work.next')} {rtl ? '←' : '→'}
          </button>
          <button className="nb-pill nb-pill--close" ref={closeBtn} onClick={onClose}>{t('ed.nav.close')} ✕</button>
        </div>
      </div>

      <div className="nb-case__body" key={p.id}>
        <h1 className="nb-case__title" dir="ltr" style={{ textAlign: 'start' }}>{p.title}</h1>
        <p className="nb-case__sub">{p.subtitle}</p>

        <div className="nb-case__cols">
          <dl className="nb-case__dl">
            <div><dt className="nb-mono">{t('ed.work.kind')}</dt><dd>{p.kind}</dd></div>
            <div><dt className="nb-mono">{t('ed.work.stack')}</dt><dd>{p.tags.map((x) => <span key={x} className="nb-chip nb-mono">{x}</span>)}</dd></div>
            <div><dt className="nb-mono">{t('ed.work.screens')}</dt><dd>{p.images.length}</dd></div>
            <div style={{ background: 'transparent', border: 0, boxShadow: 'none', padding: 0 }}>
              {p.liveUrl
                ? <a className="nb-btn nb-btn--pink" href={p.liveUrl} target="_blank" rel="noopener noreferrer">{t('ed.work.live')} <span className="nb-arrow">↗</span></a>
                : <span className="nb-chip nb-chip--fill nb-mono">{t('ed.work.private')}</span>}
            </div>
          </dl>
          <p className="nb-case__desc">{p.description}</p>
        </div>

        <div className="nb-case__shots">
          {p.images.map((src, i) => (
            <figure className="nb-shot" key={src}>
              <figcaption className="nb-mono"><span>{pad(i + 1)}</span><span>{p.labels[i]}</span></figcaption>
              <img src={src} alt={`${p.title} — ${p.labels[i]}`} loading={i > 1 ? 'lazy' : 'eager'} decoding="async" />
            </figure>
          ))}
        </div>

        <button className="nb-case__next" onClick={() => onGo((index + 1) % projects.length)}>
          <span className="nb-mono">{t('ed.work.next')} →</span>
          <strong dir="ltr" style={{ textAlign: 'start' }}>{next.title}</strong>
        </button>
      </div>
    </motion.div>
  )
}

export default function Work() {
  const { t } = useTranslation()
  const projects = useProjects()
  const [open, setOpen] = useState(-1)
  const close = useCallback(() => setOpen(-1), [])

  return (
    <section id="work" className="nb-section nb-work">
      <div className="nb-wrap">
        <SectionHead no={2} label={t('ed.work.label')} title={t('ed.work.title')} aside={`${t('ed.work.count', { n: projects.length })} — ${t('ed.work.hint')}`} />
        <div className="nb-work__grid">
          {projects.map((p, i) => (
            <button
              key={p.id}
              className="nb-card"
              onClick={() => setOpen(i)}
              data-reveal
              style={{ '--d': `${(i % 2) * 0.1}s`, '--r0': i % 2 ? '1.5deg' : '-1.5deg' }}
              aria-label={`${t('ed.work.open')}: ${p.title}`}
            >
              <span className="nb-card__top nb-mono" style={{ background: TINTS[i % TINTS.length] }}>
                <span className="nb-card__no">{pad(i + 1)}</span>
                <span>{p.kind}</span>
              </span>
              <span className="nb-card__img">
                <img src={p.images[0]} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="nb-card__body">
                <span className="nb-card__title" dir="ltr" style={{ textAlign: 'start' }}>{p.title}</span>
                <span className="nb-card__sub">{p.subtitle}</span>
                <span className="nb-card__tags nb-mono">{p.tags.slice(0, 4).map((x) => <span key={x} className="nb-chip">{x}</span>)}</span>
                <span className="nb-card__go"><span>{t('ed.work.open')}</span><span aria-hidden>→</span></span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open >= 0 && projects[open] && <Case key="case" projects={projects} index={open} onClose={close} onGo={setOpen} />}
      </AnimatePresence>
    </section>
  )
}
