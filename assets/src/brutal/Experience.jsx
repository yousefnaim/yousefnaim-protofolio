import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionHead } from './About'

export default function Experience() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(0)

  useEffect(() => {
    const local = t('experience.items', { returnObjects: true })
    setItems(Array.isArray(local) ? local : [])
  }, [i18n.language, t])

  return (
    <section id="experience" className="nb-section nb-exp-sec">
      <div className="nb-wrap">
        <SectionHead no={4} label={t('ed.experience.label')} title={t('ed.experience.title')} aside={t('ed.experience.hint')} />
        <div className="nb-exp">
          {items.map((x, i) => {
            const current = /present|الآن|حتى/i.test(x.period || '')
            const isOpen = open === i
            return (
              <div key={i} className={`nb-exp__item${isOpen ? ' open' : ''}`} data-reveal style={{ '--r0': i % 2 ? '1deg' : '-1deg' }}>
                <button className="nb-exp__btn" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                  <span>
                    <span className="nb-exp__period nb-mono">
                      <span>{x.period}</span>
                      {current && <span className="nb-now">{t('ed.experience.now')}</span>}
                    </span>
                    <span className="nb-exp__role">{x.role}</span>
                    <span className="nb-exp__co nb-mono">{x.company}</span>
                  </span>
                  <span className="nb-plus" aria-hidden />
                </button>
                <div className="nb-exp__panel">
                  <div>
                    <div className="nb-exp__more">
                      <p>{x.description}</p>
                      <ul>{(x.achievements || []).map((a) => <li key={a}><span>{a}</span></li>)}</ul>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
