import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import emailjs from '@emailjs/browser'
import { SectionHead } from './About'
import { CONTACT } from './data'

export default function Contact() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [copied, setCopied] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }))
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(CONTACT.email); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!form.name.trim()) er.name = t('ed.contact.e_name')
    if (!form.email.trim()) er.email = t('ed.contact.e_mail')
    else if (!/\S+@\S+\.\S+/.test(form.email)) er.email = t('ed.contact.e_mail_bad')
    if (!form.message.trim()) er.message = t('ed.contact.e_msg')
    setErrors(er)
    if (Object.keys(er).length) return
    setStatus('sending')
    try {
      await emailjs.send(
        CONTACT.emailjs.service, CONTACT.emailjs.template,
        { name: form.name, email: form.email, message: form.message, title: 'Portfolio Contact Request' },
        CONTACT.emailjs.key
      )
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
      setTimeout(() => setStatus('idle'), 6000)
    } catch {
      setStatus('failed')
    }
  }

  const field = (id, label, Tag = 'input', props = {}) => (
    <label className={`nb-field${errors[id] ? ' err' : ''}`}>
      <span>{label}</span>
      <Tag value={form[id]} onChange={set(id)} aria-invalid={!!errors[id]} {...props} />
      <em className="nb-err">{errors[id]}</em>
    </label>
  )

  return (
    <section id="contact" className="nb-section nb-contact">
      <div className="nb-wrap">
        <SectionHead no={5} label={t('ed.contact.label')} title={t('ed.contact.label')} />
        <h2 className="nb-contact__title" data-reveal>
          {t('ed.contact.title_a')}<br /><mark>{t('ed.contact.title_b')}</mark>
        </h2>

        <div className="nb-contact__grid">
          <div data-reveal>
            <p className="nb-contact__text">{t('ed.contact.text')}</p>
            <a className="nb-mail" href={CONTACT.gmail} target="_blank" rel="noopener noreferrer">{CONTACT.email}</a>
            <div className="nb-contact__actions">
              <button className="nb-btn" onClick={copy}>{copied ? t('ed.contact.copied') : t('ed.contact.copy')}</button>
              <a className="nb-btn nb-btn--yellow" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                {t('ed.contact.whatsapp')} <span className="nb-arrow">↗</span>
              </a>
            </div>
          </div>

          <form className="nb-form" onSubmit={submit} noValidate data-reveal style={{ '--d': '0.1s' }}>
            <h3 className="nb-mono">{t('ed.contact.form_title')}</h3>
            {field('name', t('ed.contact.name'), 'input', { autoComplete: 'name' })}
            {field('email', t('ed.contact.mail'), 'input', { type: 'email', autoComplete: 'email', dir: 'ltr' })}
            {field('message', t('ed.contact.message'), 'textarea', { rows: 4 })}
            <button type="submit" className="nb-btn nb-btn--pink" disabled={status === 'sending'} style={{ justifySelf: 'start' }}>
              {status === 'sending' ? t('ed.contact.sending') : t('ed.contact.send')} <span className="nb-arrow">→</span>
            </button>
            <p className={`nb-status${status === 'sent' ? ' ok' : status === 'failed' ? ' bad' : ''}`} role="status">
              {status === 'sent' ? t('ed.contact.sent') : status === 'failed' ? t('ed.contact.failed') : ''}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
