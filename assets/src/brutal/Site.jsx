import { Suspense, lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Lenis from 'lenis'
import './brutal.css'
import Nav from './Nav'
import Hero from './Hero'
import About from './About'
import { attachSfx } from './sfx'
import { SITE } from './data'

const Work = lazy(() => import('./Work'))
const Stack = lazy(() => import('./Stack'))
const Experience = lazy(() => import('./Experience'))
const Contact = lazy(() => import('./Contact'))
const Footer = lazy(() => import('./Footer'))
const MorphPanel = lazy(() => import('../components/ui/ai-input').then((m) => ({ default: m.MorphPanel })))

function Loader({ onDone }) {
  const [n, setN] = useState(0)
  const [out, setOut] = useState(false)
  const { i18n } = useTranslation()

  useEffect(() => {
    let raf, finished = false
    const start = performance.now()
    let fontsOk = false
    const fonts = document.fonts?.ready ?? Promise.resolve()
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1600))]).then(() => { fontsOk = true })
    const step = (now) => {
      const p = Math.min(1, (now - start) / 800)
      setN(Math.round((fontsOk ? p : Math.min(p, 0.9)) * 100))
      if (p >= 1 && fontsOk && !finished) {
        finished = true
        setOut(true)
        setTimeout(onDone, 750)
      } else if (!finished) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  const ar = i18n.language === 'ar'
  return (
    <div className={`nb-loader${out ? ' out' : ''}`} aria-hidden>
      <div className="nb-loader__card">
        <div className="nb-loader__name">{ar ? SITE.nameAr : SITE.name}</div>
        <div className="nb-loader__bar"><i style={{ width: `${n}%` }} /></div>
        <div className="nb-loader__row nb-mono"><span>{ar ? 'جارٍ التحميل' : 'Loading'}</span><span>{n}%</span></div>
      </div>
    </div>
  )
}

export default function Site() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const [loaderGone, setLoaderGone] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    html.dir = isAr ? 'rtl' : 'ltr'
    html.lang = isAr ? 'ar' : 'en'
    document.body.style.fontFamily = ''
    document.body.style.background = 'var(--nb-paper, #fffdf5)'
    return () => { document.body.style.background = '' }
  }, [isAr])

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)) })
    window.__lenis = lenis
    let raf
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = null }
  }, [])

  // UI sounds (hover / click). Silent until the visitor interacts with the page.
  useEffect(() => attachSfx(document), [])

  // Scroll reveals (state lives in a data attribute so React re-renders can't wipe it)
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target) } }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
    )
    const seen = new WeakSet()
    const scan = () => document.querySelectorAll('.nb [data-reveal]:not([data-in])').forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el) } })
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.querySelector('.nb'), { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])

  return (
    <div className="nb">
      {!loaderGone && <Loader onDone={() => setLoaderGone(true)} />}
      <a className="nb-skip nb-mono" href="#about">{t('ed.nav.skip')}</a>
      <Nav />
      <main>
        <Hero />
        <About />
        <Suspense fallback={null}>
          <Work />
          <Stack />
          <Experience />
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}><Footer /></Suspense>
      <div className="nb-chat">
        <Suspense fallback={null}><MorphPanel /></Suspense>
      </div>
    </div>
  )
}
