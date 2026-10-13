import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../../style.css'

const MAX_MESSAGES = 40

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// The API key stays on the server (/api/chat); the browser only sees error codes.
class ChatError extends Error {
  constructor(code) { super(code); this.code = code }
}

async function askAssistant(messages, locale) {
  let res
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, messages: messages.map((m) => ({ role: m.role, text: m.text })) }),
    })
  } catch {
    throw new ChatError('request')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ChatError(data.error || 'request')
  return data.text || ''
}

function getFriendlyAiError(t, err) {
  switch (err?.code) {
    case 'no_key': return t('ai_chat.err_no_key')
    case 'quota': return t('ai_chat.err_quota_exceeded')
    case 'rate': return t('ai_chat.err_rate_limit')
    default: return t('ai_chat.err_request')
  }
}

const MD_LINK_TOKEN = '___MDLINK_'
const MD_LINK_END = '___'

function normalizeHref(raw) {
  return String(raw)
    .trim()
    .replace(/[),.;:!?]+$/g, '')
}

function renderMessageBody(text) {
  const mdLinks = []
  const withTokens = String(text).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/gi, (_full, label, href) => {
    const i = mdLinks.length
    mdLinks.push({ label, href: normalizeHref(href) })
    return `${MD_LINK_TOKEN}${i}${MD_LINK_END}`
  })

  const splitRe = new RegExp(
    `(${MD_LINK_TOKEN}\\d+${MD_LINK_END}|https?:\\/\\/[^\\s<>"')\\]]+|mailto:[^\\s<>"')\\]]+|wa\\.me\\/[^\\s<>"')\\]]+)`,
    'gi'
  )
  const parts = withTokens.split(splitRe).filter((p) => p !== '')

  return parts.map((piece, idx) => {
    const tokenMatch = piece.match(new RegExp(`^${MD_LINK_TOKEN}(\\d+)${MD_LINK_END}$`))
    if (tokenMatch) {
      const { label, href } = mdLinks[Number(tokenMatch[1])]
      const isMail = href.startsWith('mailto:')
      return (
        <a
          key={idx}
          className="ai-input__link"
          href={href}
          {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {label}
        </a>
      )
    }
    if (/^wa\.me\//i.test(piece)) {
      const href = normalizeHref(`https://${piece}`)
      return (
        <a key={idx} className="ai-input__link" href={href} target="_blank" rel="noopener noreferrer">
          {href}
        </a>
      )
    }
    if (/^https?:\/\//i.test(piece) || /^mailto:/i.test(piece)) {
      const href = normalizeHref(piece)
      const isMail = href.startsWith('mailto:')
      return (
        <a
          key={idx}
          className="ai-input__link"
          href={href}
          {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {isMail ? href.replace(/^mailto:/i, '') : href}
        </a>
      )
    }
    return (
      <span key={idx} className="ai-input__text-run">
        {piece}
      </span>
    )
  })
}

export function MorphPanel({
  isActive = false,
  isShrunken = false,
  hoverShift = -6,
  shouldShake = false,
  onHoverStart,
  onHoverEnd,
}) {
  const { t, i18n } = useTranslation()
  const rootRef = React.useRef(null)
  const inputRef = React.useRef(null)
  const chatEndRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [messages, setMessages] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const messagesRef = React.useRef(messages)
  React.useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const uiLocale = i18n.language === 'ar' ? 'ar' : 'en'

  const quickChips = React.useMemo(
    () => [
      { key: 'who', label: t('ai_chat.chip_who'), prompt: t('ai_chat.send_who') },
      { key: 'skills', label: t('ai_chat.chip_skills'), prompt: t('ai_chat.send_skills') },
      { key: 'work', label: t('ai_chat.chip_work'), prompt: t('ai_chat.send_work') },
      { key: 'projects', label: t('ai_chat.chip_projects'), prompt: t('ai_chat.send_projects') },
      { key: 'contact', label: t('ai_chat.chip_contact'), prompt: t('ai_chat.send_contact') },
    ],
    [t, i18n.language]
  )

  React.useEffect(() => {
    function handleOutsideClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, open])

  const sendPromptFromUser = React.useCallback(
    async (rawPrompt) => {
      const prompt = rawPrompt.trim()
      if (!prompt || loading) return

      const userMsg = { id: newId(), role: 'user', text: prompt }
      const prev = messagesRef.current
      const trimmedHistory = prev.length >= MAX_MESSAGES ? prev.slice(-MAX_MESSAGES + 1) : prev
      const historyForRequest = [...trimmedHistory, userMsg]

      setMessages(historyForRequest)
      setMessage('')
      setLoading(true)
      setError('')

      try {
        const text = (await askAssistant(historyForRequest, uiLocale)) || (uiLocale === 'ar' ? 'ما وصل رد' : 'No reply received')
        setMessages([...historyForRequest, { id: newId(), role: 'assistant', text }])
      } catch (err) {
        setError(getFriendlyAiError(t, err))
        setMessages((cur) => cur.filter((m) => m.id !== userMsg.id))
        setMessage(prompt)
      } finally {
        setLoading(false)
      }
    },
    [loading, uiLocale, t]
  )

  async function handleSubmit(e) {
    e.preventDefault()
    await sendPromptFromUser(message)
  }

  return (
    <div ref={rootRef} className="ai-input">
      <motion.button
        type="button"
        animate={{
          x: isActive ? hoverShift : 0,
          scale: isActive ? 1.22 : isShrunken ? 0.78 : 1,
          rotate: shouldShake && !isActive ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
        }}
        transition={
          shouldShake && !isActive
            ? { rotate: { duration: 0.75, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }, type: 'spring', stiffness: 320, damping: 22 }
            : { type: 'spring', stiffness: 320, damping: 22 }
        }
        whileTap={{ scale: 0.94 }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        onClick={() => setOpen((prev) => !prev)}
        className="ai-input__toggle"
        aria-label={t('ai_chat.toggle')}
      >
        <Sparkles size={20} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="ai-input__panel"
          >
            <header className="ai-input__header">
              <div className="ai-input__title">
                <Sparkles size={18} aria-hidden />
                <span>{t('ai_chat.header_title')}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ai-input__close"
                aria-label={t('ai_chat.close')}
              >
                <X size={18} />
              </button>
            </header>

            <div className="ai-input__body">
              <div className="ai-input__chips" role="group" aria-label={t('ai_chat.panel_hint')}>
                {quickChips.map(({ key, label, prompt }) => (
                  <button
                    key={key}
                    type="button"
                    className="ai-input__chip"
                    disabled={loading}
                    onClick={() => sendPromptFromUser(prompt)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div
                className="ai-input__chat" data-lenis-prevent
                role="log"
                aria-live="polite"
                onWheel={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {messages.length === 0 && !loading && !error && (
                  <p className="ai-input__chat-empty">{t('ai_chat.panel_hint')}</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={m.role === 'user' ? 'ai-input__row ai-input__row--user' : 'ai-input__row ai-input__row--assistant'}
                  >
                    <div className={m.role === 'user' ? 'ai-input__bubble ai-input__bubble--user' : 'ai-input__bubble ai-input__bubble--assistant'}>
                      {renderMessageBody(m.text)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="ai-input__row ai-input__row--assistant">
                    <div className="ai-input__bubble ai-input__bubble--assistant ai-input__bubble--typing">
                      <span className="ai-input__dot" />
                      <span className="ai-input__dot" />
                      <span className="ai-input__dot" />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="ai-input__chat-error" role="alert">
                    {error}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="ai-input__form">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder={t('ai_chat.placeholder')}
                  className="ai-input__textarea ai-input__textarea--chat"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="ai-input__submit ai-input__submit--icon"
                  aria-label={loading ? t('ai_chat.btn_thinking') : t('ai_chat.btn_send')}
                  title={loading ? t('ai_chat.btn_thinking') : t('ai_chat.btn_send')}
                >
                  <Send size={17} aria-hidden />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MorphPanel
