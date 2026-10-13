// Retrieval for the portfolio assistant.
// 1) The knowledge base is generated from the site's own data (locale files, project facts, stack,
//    contact) — nothing is hand-copied, so the assistant can't drift from the website.
// 2) Retrieval is hybrid: BM25 keyword search (Arabic-normalised) + Gemini embeddings, fused with RRF.
//    If embeddings are unavailable it falls back to BM25 alone.
import en from '../src/i18n/locales/en.json' with { type: 'json' }
import ar from '../src/i18n/locales/ar.json' with { type: 'json' }
import { PROJECTS_META } from '../src/data/projectsMeta.js'
import { SITE, CONTACT, STACK, TOOLS } from '../src/data/siteFacts.js'

const EMBED_MODEL = 'gemini-embedding-001'
const EMBED_DIM = 256
const TOP_K = 6

const LABELS = {
  en: {
    identity: 'Identity', role: 'Role', location: 'Based in', exp: 'Experience', status: 'Status', stack: 'Core stack',
    summary: 'Summary', stats: 'Key facts', tz: 'Time zone: UTC+3', contact: 'Contact', email: 'Email', phone: 'Phone / WhatsApp',
    wa: 'WhatsApp link', gmail: 'Write an email (Gmail link)', reply: 'Usually replies within 24 hours.',
    avail: 'Available for full-time roles, freelance projects, and conversations.',
    skills: 'Skills', tools: 'Other tools', experience: 'Work experience', project: 'Project', kind: 'Type', tags: 'Tech stack',
    live: 'Live site', nolive: 'No public demo (production / private system).', screens: 'Screens shown in the portfolio',
    overview: 'All projects in display order', highlight: 'What they do',
  },
  ar: {
    identity: 'الهوية', role: 'التخصص', location: 'المقر', exp: 'الخبرة', status: 'الحالة', stack: 'التقنيات الأساسية',
    summary: 'نبذة', stats: 'معلومات سريعة', tz: 'المنطقة الزمنية: UTC+3', contact: 'التواصل', email: 'البريد', phone: 'الهاتف / واتساب',
    wa: 'رابط واتساب', gmail: 'كتابة رسالة بريد (رابط Gmail)', reply: 'يرد عادةً خلال 24 ساعة.',
    avail: 'متاح لوظائف بدوام كامل ومشاريع حرة ومحادثات.',
    skills: 'المهارات', tools: 'أدوات أخرى', experience: 'الخبرة العملية', project: 'مشروع', kind: 'النوع', tags: 'التقنيات',
    live: 'الموقع المباشر', nolive: 'لا يوجد عرض عام (نظام إنتاجي / خاص).', screens: 'الشاشات المعروضة في البورتفوليو',
    overview: 'كل المشاريع بترتيب العرض', highlight: 'ماذا يقدّم صاحب الموقع',
  },
}

// Extra search words (not shown to the model) so everyday phrasing finds the right chunk
const KEYWORDS = {
  en: {
    identity: 'who about bio background name location where from country city age',
    contact: 'contact hire hiring reach email mail phone call whatsapp message talk get in touch freelance available',
    skills: 'tech stack technologies languages frameworks skills tools know knows programming backend frontend mobile database',
    experience: 'work job jobs employer company career history previous worked experience years',
    projects: 'project projects portfolio work case study built website app live demo link',
  },
  ar: {
    identity: 'من هو عن نبذة تعريف اسم وين مكان بلد مدينة عمر',
    contact: 'تواصل اتواصل اتصال كلم اكلمه بريد ايميل هاتف رقم واتساب رسالة توظيف توظيفه استعين مستقل متاح',
    skills: 'تقنيات مهارات لغات برمجة اطار ادوات يعرف يشتغل باك اند فرونت اند موبايل قاعده بيانات',
    experience: 'خبره عمل شغل وظيفه شركه شركات سابق اشتغل سنوات',
    projects: 'مشروع مشاريع اعمال اعماله موقع تطبيق رابط معاينه ديمو',
  },
}

// Arabic spellings of common tech words → the English term used in the data
// (patterns are written in normalised form: no hamza variants, ة → ه)
const ALIASES = [
  [/باك\s?اند|بك\s?اند/, 'backend'], [/فرونت\s?اند/, 'frontend'], [/فول\s?ستاك/, 'fullstack'],
  [/نكست/, 'nextjs'], [/نود/, 'nodejs'], [/ريا?كت/, 'react'], [/فلاتر/, 'flutter'], [/اكسبرس/, 'express'],
  [/دوكر/, 'docker'], [/بر[يز]?زما/, 'prisma'], [/تايب\s?سكربت/, 'typescript'], [/مونجو/, 'mongodb'],
  // add project-specific Arabic spellings here, e.g. [/اسم_المشروع/, 'project-title'],
]
const expandQuery = (q) => {
  const n = normalize(q)
  return ALIASES.reduce((acc, [re, en]) => (re.test(n) ? `${acc} ${en}` : acc), q)
}

/** Build the chunk list for one locale from the site data. */
function buildChunks(lang) {
  const j = lang === 'ar' ? ar : en
  const L = LABELS[lang]
  const K = KEYWORDS[lang]
  const name = lang === 'ar' ? `${SITE.nameAr} (${SITE.name})` : SITE.name
  const chunks = []
  const add = (id, title, text, kw = '') => chunks.push({ id, title, text: `${title}\n${text}`, kw })

  const stats = (j.ed.about.stats || []).map((s) => `${s.v} — ${s.l}`).join('; ')
  add('identity', L.identity, [
    name,
    `${L.role}: ${j.ed.hero.role}`,
    `${L.location}: ${j.ed.hero.based_v} (${L.tz})`,
    `${L.exp}: ${j.ed.hero.exp_v}`,
    `${L.status}: ${j.ed.hero.status_v}`,
    `${L.stack}: ${j.ed.hero.stack_v}`,
    `${j.ed.hero.statement}`,
    `${L.summary}: ${j.ed.about.pre}${j.ed.about.em}${j.ed.about.post}`,
    `${L.stats}: ${stats}`,
  ].join('\n'), K.identity)

  add('contact', L.contact, [
    `${L.email}: ${CONTACT.email}`,
    `${L.phone}: ${CONTACT.phone}`,
    `${L.wa}: ${CONTACT.whatsapp}`,
    `${L.gmail}: ${CONTACT.gmail}`,
    L.avail,
    L.reply,
  ].join('\n'), K.contact)

  ;(j.about.highlights || []).forEach((h, i) => add(`highlight-${i}`, `${L.highlight}: ${h.title}`, h.text, K.skills))

  const cats = j.skills.categories || []
  STACK.forEach((list, i) => add(`skills-${i}`, `${L.skills}: ${cats[i] || ''}`, list.join(', '), K.skills))
  add('tools', L.tools, TOOLS.join(', '), K.skills)

  ;(j.experience.items || []).forEach((x, i) =>
    add(`exp-${i}`, `${L.experience}: ${x.role} — ${x.company}`, [
      x.period, x.description, ...(x.achievements || []).map((a) => `• ${a}`),
    ].join('\n'), K.experience)
  )

  const items = j.projects.items || []
  const kinds = j.ed.work.kinds || []
  const ordered = [...PROJECTS_META].sort((a, b) => a.order - b.order)
  ordered.forEach((p, pos) => {
    const k = p.i18nIndex
    const loc = items[k] || {}
    add(`project-${p._id}`, `${L.project} ${pos + 1}: ${p.title}`, [
      `${loc.subtitle || p.subtitle}`,
      `${L.kind}: ${kinds[k] || ''}`,
      `${loc.description || p.description}`,
      `${L.tags}: ${p.tags.join(', ')}`,
      p.liveUrl ? `${L.live}: ${p.liveUrl}` : L.nolive,
      loc.labels?.length ? `${L.screens}: ${loc.labels.join(', ')}` : '',
    ].filter(Boolean).join('\n'), K.projects)
  })
  add('projects-overview', L.overview, ordered.map((p, pos) =>
    `${pos + 1}) ${p.title} — ${kinds[p.i18nIndex] || ''} — ${p.liveUrl || L.nolive}`
  ).join('\n'), K.projects)

  return chunks
}

/* ---------- BM25 ---------- */
const AR_DIACRITICS = /[ً-ْـ]/g
function normalize(s) {
  return s
    .toLowerCase()
    .replace(AR_DIACRITICS, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/(\p{L})\.(\p{L})/gu, '$1$2') // next.js → nextjs
}
function stem(tok) {
  if (/[؀-ۿ]/.test(tok)) {
    let t = tok.replace(/^(وال|بال|كال|فال|لل|ال)/, '')
    if (t.length > 3 && t[0] === 'و') t = t.slice(1)
    if (t.length > 4) t = t.replace(/(ته|ها|هم|ات|ون|ين|ان)$/, '')
    if (t.length > 3) t = t.replace(/[هيك]$/, '')
    return t.length >= 2 ? t : tok
  }
  return tok.length > 3 && tok.endsWith('s') ? tok.slice(0, -1) : tok
}
const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'is', 'are', 'and', 'in', 'on', 'for', 'with', 'what', 'who', 'how', 'does', 'do', 'he', 'his', 'me', 'من', 'في', 'على', 'عن', 'ما', 'هو', 'هي', 'هل', 'ماذا', 'كيف', 'لي'])
const tokens = (s) => normalize(s).split(/[^\p{L}\p{N}#+]+/u).filter((t) => t && !STOP.has(t)).map(stem)

function buildIndex(chunks) {
  const docs = chunks.map((c) => tokens(`${c.title} ${c.title} ${c.text} ${c.kw}`)) // title counted twice
  const df = new Map()
  docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) || 0) + 1)))
  const avg = docs.reduce((s, d) => s + d.length, 0) / docs.length
  return { docs, df, avg, n: docs.length }
}
function bm25(index, query) {
  const q = [...new Set(tokens(query))]
  const k1 = 1.4, b = 0.75
  return index.docs.map((d) => {
    const tf = new Map()
    d.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1))
    let s = 0
    for (const t of q) {
      const f = tf.get(t)
      if (!f) continue
      const idf = Math.log(1 + (index.n - (index.df.get(t) || 0) + 0.5) / ((index.df.get(t) || 0) + 0.5))
      s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.length) / index.avg)))
    }
    return s
  })
}

/* ---------- Embeddings ---------- */
const cosine = (a, b) => {
  let d = 0, x = 0, y = 0
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i] }
  return d / (Math.sqrt(x * y) || 1)
}

const kb = {} // lang -> { chunks, index, vectors: Promise<number[][] | null> }
function base(lang) {
  if (!kb[lang]) {
    const chunks = buildChunks(lang)
    kb[lang] = { chunks, index: buildIndex(chunks), vectors: null, failedAt: 0 }
  }
  return kb[lang]
}

async function embedAll(ai, texts, taskType) {
  const res = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: texts,
    config: { taskType, outputDimensionality: EMBED_DIM },
  })
  return res.embeddings.map((e) => e.values)
}

async function docVectors(ai, entry) {
  if (entry.vectors) return entry.vectors
  if (Date.now() - entry.failedAt < 5 * 60_000) return null
  try {
    entry.vectors = await embedAll(ai, entry.chunks.map((c) => c.text), 'RETRIEVAL_DOCUMENT')
    return entry.vectors
  } catch (e) {
    console.error('embedding failed', String(e?.message || e).slice(0, 200))
    entry.failedAt = Date.now()
    return null
  }
}

// Clear intents always pull in their core chunks, whatever the ranking says
const INTENTS = [
  [/project|portfolio|case study|built|مشروع|مشاريع|اعمال|أعمال/i, ['projects-overview']],
  [/contact|hire|hiring|email|mail|whatsapp|phone|reach|available|تواصل|أتواصل|اتواصل|بريد|ايميل|واتس|رقم|توظيف|متاح/i, ['contact']],
  [/experience|worked|work |job|career|company|employer|خبر|شغل|عمل|وظيف|شرك/i, ['exp-0', 'exp-1']],
  [/skill|stack|tech|know|language|framework|tool|مهار|تقني|يعرف|لغات|أدوات|ادوات/i, ['skills-0', 'skills-1', 'skills-2', 'tools']],
]

const rank = (scores) => scores.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]).map(([, i]) => i)

/** Return the best chunks for a query (always includes the identity chunk). */
export async function retrieve(ai, lang, query) {
  const entry = base(lang)
  const lexical = bm25(entry.index, expandQuery(query))
  const lists = [lexical.some((s) => s > 0) ? rank(lexical).filter((i) => lexical[i] > 0) : []]

  let vectors = null
  try { vectors = await docVectors(ai, entry) } catch {}
  if (vectors) {
    try {
      const [qv] = await embedAll(ai, [query], 'RETRIEVAL_QUERY')
      lists.push(rank(vectors.map((v) => cosine(qv, v))))
    } catch {}
  }

  const fused = new Map()
  lists.forEach((list) => list.forEach((idx, r) => fused.set(idx, (fused.get(idx) || 0) + 1 / (60 + r))))
  let picked = [...fused.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_K).map(([i]) => entry.chunks[i])

  for (const [re, ids] of INTENTS) {
    if (!re.test(query)) continue
    for (const id of ids) {
      const c = entry.chunks.find((x) => x.id === id)
      if (c && !picked.includes(c)) picked.push(c)
    }
  }

  // Questions about "the projects" in general should always see the full ordered list
  if (!picked.some((c) => c.id === 'projects-overview') && picked.filter((c) => c.id.startsWith('project-')).length >= 2) {
    picked.push(entry.chunks.find((c) => c.id === 'projects-overview'))
  }
  const identity = entry.chunks.find((c) => c.id === 'identity')
  picked = [identity, ...picked.filter((c) => c.id !== 'identity')]
  return picked
}

export const _internals = { buildChunks, tokens, bm25, base }
