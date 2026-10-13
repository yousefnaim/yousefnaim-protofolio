import { useTranslation } from 'react-i18next'
import { SITE } from './data'
import portrait from '../Imgs/portrait.jpg' // your photo (4:5 works best)

export function SectionHead({ no, label, title, aside }) {
  return (
    <div className="nb-head">
      <div>
        <span className="nb-head__tag nb-mono" data-reveal><span>0{no}</span><span>{label}</span></span>
        <h2 data-reveal style={{ '--d': '0.06s' }}>{title}</h2>
      </div>
      {aside && <p className="nb-head__aside nb-mono" data-reveal style={{ '--d': '0.12s' }}>{aside}</p>}
    </div>
  )
}

export default function About() {
  const { t } = useTranslation()
  const stats = t('ed.about.stats', { returnObjects: true })
  const items = t('about.highlights', { returnObjects: true })

  return (
    <section id="about" className="nb-section">
      <div className="nb-wrap">
        <SectionHead no={1} label={t('ed.about.label')} title={t('ed.about.label')} />
        <div className="nb-about__grid">
          <figure className="nb-portrait" data-reveal>
            <div className="nb-portrait__frame">
              <div className="nb-portrait__img">
                <img src={portrait} alt={SITE.name} loading="lazy" decoding="async" />
              </div>
              <span className="nb-sticker-badge">{t('ed.hero.exp_v')}</span>
            </div>
          </figure>

          <div>
            <p className="nb-statement" data-reveal>
              {t('ed.about.pre')}<mark>{t('ed.about.em')}</mark>{t('ed.about.post')}
            </p>

            <dl className="nb-stats" style={{ margin: 0 }}>
              {Array.isArray(stats) && stats.map((s, i) => (
                <div className="nb-stat" key={s.l} data-reveal style={{ '--d': `${i * 0.07}s` }}>
                  <b>{s.v}</b>
                  <span className="nb-mono">{s.l}</span>
                </div>
              ))}
            </dl>

            <div className="nb-what">
              <span className="nb-chip nb-chip--fill nb-mono">{t('ed.about.what')}</span>
              <ol>
                {Array.isArray(items) && items.map((it, i) => (
                  <li key={it.title} data-reveal style={{ '--d': `${(i % 2) * 0.08}s` }}>
                    <h3>{it.title}</h3>
                    <p>{it.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
