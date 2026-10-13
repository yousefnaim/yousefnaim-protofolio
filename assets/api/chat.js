// Vercel serverless function: portfolio assistant (RAG over the site's own data).
// The Gemini key lives in the GEMINI_API_KEY environment variable and never reaches the browser.
import { GoogleGenAI } from '@google/genai'
import { retrieve } from './_rag.js'
import { SITE } from '../src/data/siteFacts.js'

// Best model first; if its quota/rate limit is hit, fall back to the lighter one instead of failing
const MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-3.5-flash-lite']
const cooldown = new Map() // model -> timestamp until which it is skipped (quota / overload)
const MAX_MESSAGES = 40
const MAX_CHARS = 1200
const RATE_LIMIT = 20 // requests
const RATE_WINDOW_MS = 60_000

// Best-effort per-instance limiter (serverless instances are short-lived, so this only blunts bursts)
const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k)
  return arr.length > RATE_LIMIT
}

function sameSite(req) {
  const host = req.headers.host
  const src = req.headers.origin || req.headers.referer
  if (!src || !host) return false
  try { return new URL(src).host === host } catch { return false }
}

const fail = (res, status, code) => res.status(status).json({ error: code })
const isArabic = (s) => /[؀-ۿ]/.test(s)

function systemPrompt(lang, context) {
  const reply = lang === 'ar'
    ? 'Reply in Arabic (clear, natural, friendly — Modern Standard with a light Levantine warmth is fine).'
    : 'Reply in English.'
  return `You are the assistant on ${SITE.name}'s portfolio website. You answer visitors' questions about ${SITE.name}: who they are, their skills, work experience, projects, and how to reach them.

# Grounding rules (most important)
- Use ONLY the facts in CONTEXT below. Never use outside knowledge about ${SITE.name}, and never guess.
- If the answer is not in CONTEXT, say plainly that you don't have that information, and offer his contact details so the visitor can ask him directly.
- Never invent employers, dates, degrees, clients, prices, metrics, links, or project details. Do not claim a project has a live site unless CONTEXT gives a link.
- Keep project names exactly as written in CONTEXT (English titles), and keep their listed order when listing projects.
- If the question is unrelated to ${SITE.name} or this portfolio, politely say what you can help with instead.

# Style
- ${reply} If the visitor's latest message is in a different language, follow the visitor.
- Be concise and useful: usually 2–6 short lines or bullets. Lead with the direct answer. No filler, no "based on the context".
- Write links as Markdown [label](https://...) using only URLs that appear in CONTEXT.
- If someone wants to hire ${SITE.name} or contact them, give the WhatsApp and email links from CONTEXT.

# CONTEXT
${context}`
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return fail(res, 405, 'method')
  if (!sameSite(req)) return fail(res, 403, 'forbidden')

  // GEMINI_API_KEY is the right name; VITE_GEMINI_API_KEY is accepted so an older Vercel variable keeps working
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!apiKey) return fail(res, 500, 'no_key')

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (limited(ip)) return fail(res, 429, 'rate')

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body
  const uiLang = body?.locale === 'ar' ? 'ar' : 'en'
  const input = Array.isArray(body?.messages) ? body.messages.slice(-MAX_MESSAGES) : []
  const turns = input
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_CHARS) }))
  if (!turns.length || turns[turns.length - 1].role !== 'user') return fail(res, 400, 'bad_request')

  // Knowledge language follows the visitor's latest message, falling back to the UI language
  const last = turns[turns.length - 1].text
  const lang = isArabic(last) ? 'ar' : /[a-z]/i.test(last) ? 'en' : uiLang

  // Retrieval query = latest question + the one before it, so follow-ups ("and his stack?") still resolve
  const userTurns = turns.filter((t) => t.role === 'user')
  const query = userTurns.slice(-2).map((t) => t.text).join('\n')

  try {
    const ai = new GoogleGenAI({ apiKey })
    const chunks = await retrieve(ai, lang, query)
    const context = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n')

    const request = {
      contents: turns.map((t) => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.text }] })),
      config: {
        systemInstruction: systemPrompt(lang, context),
        temperature: 0.3,
        maxOutputTokens: 700,
        thinkingConfig: { thinkingBudget: 0 }, // answer directly; thinking would eat the output budget
      },
    }
    let response
    let lastErr
    // Two passes: a brief pause lets a momentarily overloaded model recover
    for (let pass = 0; pass < 2 && !response; pass++) {
      if (pass) await new Promise((r) => setTimeout(r, 700))
      for (const model of MODELS) {
        if ((cooldown.get(model) || 0) > Date.now()) continue
        // thinkingBudget is a 2.5-family option; newer models get a larger output budget instead
        const legacy = model.startsWith('gemini-2.5')
        const config = legacy ? request.config : { ...request.config, thinkingConfig: undefined, maxOutputTokens: 1500 }
        try {
          response = await ai.models.generateContent({ model, contents: request.contents, config })
          break
        } catch (e) {
          lastErr = e
          if (e?.status === 429) cooldown.set(model, Date.now() + 90_000)
          if (e?.status === 404) cooldown.set(model, Date.now() + 3_600_000)
          console.error('chat model failed', model, e?.status, String(e?.message || e).slice(0, 160))
        }
      }
    }
    if (!response) throw lastErr
    return res.status(200).json({ text: response.text || '', sources: chunks.map((c) => c.id) })
  } catch (err) {
    console.error('chat error', err?.status, String(err?.message || err).slice(0, 400))
    const raw = `${err?.message || ''} ${err?.status || ''}`.toLowerCase()
    if (raw.includes('quota') || raw.includes('free_tier') || raw.includes('perday')) return fail(res, 429, 'quota')
    if (raw.includes('429') || raw.includes('resource_exhausted') || raw.includes('rate')) return fail(res, 429, 'rate')
    return fail(res, 502, 'request')
  }
}

function safeParse(s) { try { return JSON.parse(s) } catch { return null } }
