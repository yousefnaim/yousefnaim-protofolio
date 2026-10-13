# Chat assistant (RAG on Vercel)

Files: `api/chat.js` (endpoint), `api/_rag.js` (knowledge base + retrieval), `src/components/ui/ai-input.jsx` (UI), `src/style.css` (panel skin). The browser calls `POST /api/chat`; the Gemini key exists only in the server environment.

## Why this design

- **No key in the browser.** Anything prefixed `VITE_` is bundled into public JS. The old pattern (`import.meta.env.VITE_GEMINI_API_KEY`) leaks the key to every visitor.
- **No hand-written knowledge file.** `_rag.js` builds its chunks from the same data the site renders (locale JSON, `projectsMeta.js`, `siteFacts.js`), so the assistant can't drift from the website.

## Flow

1. UI sends `{ locale, messages[] }`.
2. Server checks: POST only, same-origin (`Origin`/`Referer` host = request host), message count/length limits, per-IP rate limit (best effort per instance).
3. Language = the visitor's last message (Arabic script → `ar`, Latin → `en`, else UI locale).
4. Retrieval query = the last two user messages (so follow-ups work).
5. `_rag.js` returns ~6–10 chunks: hybrid ranking (Arabic-normalised BM25 + `gemini-embedding-001` cosine, fused with RRF), plus forced chunks for clear intents (projects → overview list; contact; experience; skills) and the always-on identity chunk.
6. Prompt: grounding rules + the chunks as `CONTEXT`. If the answer isn't in context the model must say so and offer contact details; links only from context.
7. Generation with model fallback and cooldowns; response `{ text, sources[] }` (`sources` = chunk ids, handy for debugging).

## Chunks (per locale)

`identity`, `contact`, `highlight-*`, `skills-*`, `tools`, `exp-*`, `project-<id>` (one per project, including live URL or "no public demo"), `projects-overview` (all projects in display order with links). Add a new fact type by adding an `add(id, title, text, keywords)` call in `buildChunks()`.

## Tuning

- **Wrong chunk retrieved?** Add search words to `KEYWORDS` (not shown to the model), add Arabic spellings of your project/tech names to `ALIASES`, or add a regex to `INTENTS`.
- **Answer too long/short or off-tone?** Edit `systemPrompt()` in `chat.js` (style section). Keep the grounding rules.
- **Model errors:** the loop in `chat.js` tries `MODELS` in order and skips a model for 90s after a 429 and for 1h after a 404. Model names change — check Google's current list if a model returns 404 ("no longer available"), and update `MODELS`. Errors are logged (`vercel logs`).
- **Quota:** the free tier is small; enable billing or cap usage if traffic grows. The endpoint also limits each IP to 20 requests/minute.
- Offline test: import `retrieve` from `_rag.js` with a stub `ai` whose `embedContent` throws — retrieval then runs on BM25 alone; print the returned chunk ids for a list of sample questions.

## Quick chips

`ai_chat.chip_*` are the button labels and `ai_chat.send_*` the natural-language question each sends. Keep them plain questions; the retrieval does the rest.

## Local development

Vercel functions don't run under `vite dev`. Either run `vercel dev`, or proxy `/api` to your deployed site in `vite.config.js` (commented example included). Never default an API base URL to `localhost` in production code.
