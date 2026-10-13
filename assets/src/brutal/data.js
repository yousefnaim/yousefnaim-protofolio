import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PROJECTS_META } from '../data/projectsMeta'
import { IMAGES } from '../data/projectImages'

export { SITE, CONTACT, STACK, TOOLS } from '../data/siteFacts'

/** Projects with images + localized copy (subtitle, description, screen labels, type). */
export function useProjects() {
  const { t, i18n } = useTranslation()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const items = t('projects.items', { returnObjects: true })
    const kinds = t('ed.work.kinds', { returnObjects: true })
    setProjects(
      [...PROJECTS_META].sort((a, b) => a.order - b.order).map((p) => {
        const k = p.i18nIndex // locale arrays are index-based; display order is not
        const l = Array.isArray(items) ? items[k] : null
        const images = IMAGES[p._id] || []
        return {
          ...p,
          id: p._id,
          images,
          kind: Array.isArray(kinds) ? kinds[k] : '',
          subtitle: l?.subtitle || p.subtitle,
          description: l?.description || p.description,
          labels: l?.labels?.length ? l.labels : images.map((_, n) => `Screen ${n + 1}`),
        }
      })
    )
  }, [i18n.language, t])

  return projects
}

export const pad = (n) => String(n).padStart(2, '0')

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
