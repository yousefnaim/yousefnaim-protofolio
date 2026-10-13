import { useTranslation } from 'react-i18next'
import { scrollToId, SITE, STACK, TOOLS } from './data'

const Arrow = () => <span className="nb-arrow" aria-hidden>→</span>

function Name({ first, last, isAr }) {
  let n = 0 // running index → each letter/word plays its own note on hover
  const split = (s) =>
    isAr
      ? s.split(' ').map((w, i) => <span key={i} className="nb-wd" data-n={n++}>{w}</span>)
      : [...s].map((c, i) => <span key={i} className="nb-ch" data-n={n++}>{c}</span>)
  return (
    <h1 className="nb-hero__name" aria-label={`${first} ${last}`}>
      <span className="nb-hero__line">{split(first)}</span>
      <span className="nb-hero__line">{split(last)}</span>
    </h1>
  )
}

export default function Hero() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const words = [...STACK.flat(), ...TOOLS]
  const badge = `${t('ed.hero.status_v')} • ${t('ed.hero.role')} • `

  return (
    <section id="home" className="nb-section nb-hero">
      <div className="nb-wrap">
        <div className="nb-hero__grid">
          <div>
            <span className="nb-hero__kicker nb-mono nb-live" data-reveal>
              {t('ed.hero.kicker')} — {new Date().getFullYear()}
            </span>
            <Name first={isAr ? SITE.firstNameAr : SITE.firstName} last={isAr ? SITE.lastNameAr : SITE.lastName} isAr={isAr} />
            <p className="nb-hero__statement" data-reveal style={{ '--d': '0.15s' }}>{t('ed.hero.statement')}</p>
            <div className="nb-hero__ctas" data-reveal style={{ '--d': '0.25s' }}>
              <a className="nb-btn nb-btn--pink" href="#work" onClick={(e) => { e.preventDefault(); scrollToId('work') }}>
                {t('ed.hero.cta_work')} <Arrow />
              </a>
              <a className="nb-btn" href="#contact" onClick={(e) => { e.preventDefault(); scrollToId('contact') }} style={{ background: '#fff', color: '#111', borderColor: '#111', boxShadow: '5px 5px 0 #111' }}>
                {t('ed.hero.cta_contact')} <Arrow />
              </a>
            </div>
          </div>

          <div className="nb-hero__side">
            <div className="nb-stick" aria-hidden>
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="58" fill="#fff" stroke="#111" strokeWidth="3" />
                <defs><path id="nb-circ" d="M60,60 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" /></defs>
                <text fontSize="11.5" fontWeight="800" fill="#111" fontFamily="'JetBrains Mono', monospace" letterSpacing="1.5">
                  <textPath href="#nb-circ">{(badge + badge).toUpperCase().slice(0, 62)}</textPath>
                </text>
                <circle cx="60" cy="60" r="14" fill="#ff6b9d" stroke="#111" strokeWidth="3" />
              </svg>
            </div>
            <ul className="nb-meta nb-fix" data-reveal style={{ '--d': '0.2s' }}>
              {[['based', 'based_v'], ['exp', 'exp_v'], ['stack', 'stack_v']].map(([k, v]) => (
                <li key={k}><span className="nb-mono">{t(`ed.hero.${k}`)}</span><b>{t(`ed.hero.${v}`)}</b></li>
              ))}
            </ul>
            <div className="nb-big-stat nb-fix" data-reveal style={{ '--d': '0.3s' }}>
              <b>6</b>
              <span className="nb-mono">{t('ed.about.stats.1.l')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="nb-ticker" aria-hidden>
        <div className="nb-ticker__track">
          {[0, 1].map((n) => (
            <div key={n} style={{ display: 'flex' }}>
              {words.map((w) => <span key={w + n} className="nb-ticker__item">{w}</span>)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 36 }} />
    </section>
  )
}
