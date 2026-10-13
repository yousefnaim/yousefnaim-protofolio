import { useTranslation } from 'react-i18next'
import { SectionHead } from './About'
import { STACK, TOOLS } from './data'

export default function Stack() {
  const { t } = useTranslation()
  const cats = t('skills.categories', { returnObjects: true })

  return (
    <section id="stack" className="nb-section">
      <div className="nb-wrap">
        <SectionHead no={3} label={t('ed.stack.label')} title={t('ed.stack.title')} aside={t('ed.stack.intro')} />
        <div className="nb-stack__grid">
          {STACK.map((list, c) => (
            <div className="nb-stack__col" key={c} data-reveal style={{ '--d': `${c * 0.1}s` }}>
              <h3 className="nb-mono"><span>{Array.isArray(cats) ? cats[c] : ''}</span><span>0{list.length}</span></h3>
              <ul>{list.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="nb-stack__tools" data-reveal>
          {TOOLS.map((x) => <span key={x} className="nb-mono">{x}</span>)}
        </div>
      </div>
    </section>
  )
}
