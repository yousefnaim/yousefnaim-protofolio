---
name: yousefnaim-protofolio
description: Complete neo-brutalist portfolio kit (React + Vite) — bilingual EN/AR with RTL, light/dark, case-study overlay, generative music + hover sound effects, and a server-side RAG chat assistant for Vercel. Use when building, restyling, or extending a personal portfolio in this style (thick black borders, hard offset shadows, flat saturated colors, tilted cards), when asked to reproduce this look, or when editing a portfolio created from this kit.
---

# Neo-brutalist portfolio kit

A full, tested portfolio template extracted from a production site. Everything is in `assets/` — copy it into a fresh Vite + React project, replace the placeholder data with the owner's own, and ship. The kit was verified to `vite build` from scratch and render with no console errors.

## What you get

- **Design system** — flat saturated colors, 3px borders, solid offset shadows, tilted tiles (`assets/src/brutal/brutal.css`, scoped under `.nb`).
- **Sections** — loader · fixed nav (scroll-spy, theme + language + sound toggles, mobile sheet) · hero with per-letter hover · about · work grid with a full-screen **case-study overlay** (prev/next, keyboard, focus restore) · stack · experience accordion · contact form · footer with a live local clock.
- **Bilingual + RTL** — English/Arabic with logical CSS properties; light/dark with no flash.
- **Sound** — generative 124 BPM synthwave loop and hover/click effects (each hero letter plays a pentatonic note). No audio files, no licensing.
- **Assistant** — floating chat backed by `api/chat.js`: RAG over the owner's own data (Arabic-aware BM25 + Gemini embeddings), grounded answers, model fallback, same-origin + rate limit. The API key never reaches the browser.
- **Deploy config** — `vercel.json` (SPA rewrites), `.vercelignore`.

## Quick start (new project)

1. `npm create vite@latest my-portfolio -- --template react` and install the dependencies listed in `assets/package.deps.json` (`i18next react-i18next lenis framer-motion lucide-react @emailjs/browser @google/genai`).
2. Copy the contents of `assets/` into the project root (merge `src/`, replace `index.html` and `vite.config.js`, add `api/`, `vercel.json`, `.vercelignore`). **Delete the default `src/App.css`/`index.css` imports** — the kit brings its own CSS via `brutal.css`.
3. Fill in the owner's data (see *What to personalize*).
4. Add the portrait at `src/Imgs/portrait.jpg` and project screenshots under `public/projects/` (WebP, ≤1280px wide).
5. `npm run dev` → check light/dark, EN/AR, 375px and 1440px. `npx vite build` must pass.
6. Deploy: see `references/deploy-and-secrets.md`.

## What to personalize (the only files that carry content)

| File | What to put in it |
|---|---|
| `src/data/siteFacts.js` | name (EN/AR), hero name split, nav initials, location, time zone, contact links, EmailJS public IDs, tech stack columns, tools |
| `src/data/projectsMeta.js` | projects: title, tags, live URL (or `null`), `order`, `i18nIndex` |
| `src/data/projectImages.js` | screenshots per project; first image is the card cover |
| `src/i18n/locales/{en,ar}.json` | all copy — hero statement, about text/stats, highlights, experience, per-project subtitle/description/screen labels, project "kinds", contact text, assistant prompts |
| `index.html` | `<title>`, description, favicon |

Rules while filling in: write facts only the owner can confirm; never invent clients, numbers, dates, or links; keep tech names in English in both languages; `projects.items[i]` in the locale files must line up with `i18nIndex`.

## Design language (summary — details in `references/design-system.md`)

- **Flat color only.** No gradients, glow, blur, glass, or purple "AI" look. Depth = border + hard shadow.
- **Borders** `3px solid var(--nb-line)` · **shadows** solid offsets (`5px/8px 8px 0`, `12–14px` on hover) · **tilt** `-2°…2°`, straighten on hover.
- **Type:** Bricolage Grotesque 800 uppercase for display, Space Grotesk for body, JetBrains Mono uppercase for labels. Arabic: Cairo 700–900, no tracking, no uppercase.
- **Contrast rule:** text on a saturated fill is always `#111` with `#111` borders in both themes; only neutral surfaces flip with the theme.
- **Section rhythm:** hero yellow → about paper → work blue → stack paper → experience lilac → contact pink → footer black. Recolor by changing the `--nb-*` tokens; keep the rhythm.

## Engineering rules (keep these when editing)

- **Reveal state in a data attribute** (`data-reveal` → `data-in`), never a class — React re-renders overwrite classes.
- **Case overlay needs `data-lenis-prevent`**, otherwise Lenis blocks the wheel inside it. Same for any scrollable overlay (assistant chat, mobile sheet).
- **Use logical CSS** (`inline-start/end`, `margin-inline`), flip arrows in RTL, wrap numeric counters in `dir="ltr"`, never letter-space Arabic.
- **Never call `localhost` from production code** — browsers ask visitors for local-network permission. Call an API only when its URL env var is set.
- **Performance:** lazy-load below-the-fold sections; WebP images with `loading="lazy"`; animate `transform`/`opacity` only; respect `prefers-reduced-motion`; no heavy 3D/UI libraries on the public path.
- **Secrets:** API keys live only in server env vars (`GEMINI_API_KEY`). Never prefix a secret with `VITE_` (it is bundled into the browser). Public EmailJS IDs are fine in client code.
- **Accessibility:** visible focus ring, skip link, `aria-pressed` on toggles, `role="dialog"` + focus restore on overlays, reduced-motion support.

## Verify before saying "done"

1. `npx vite build` passes.
2. Light + dark, EN + AR (RTL), 375px and 1440px; no horizontal overflow.
3. Open a case study → Prev/Next/`Esc`, scroll inside it with the mouse wheel.
4. Hover the hero name and controls (after one click) to confirm sounds; toggles persist.
5. If the assistant is deployed: ask a contact question, a list-all-projects question, and something not in the data (it must say it doesn't know).
6. The preview pane may be hidden (animations paused) — confirm motion with a second screenshot or a real browser.

## References (read when needed)

- `references/design-system.md` — tokens, class catalog, section recipes, how to recolor or add a section.
- `references/interaction-and-sound.md` — hover/press behavior, reveal system, music + SFX architecture and tuning.
- `references/i18n-and-rtl.md` — locale structure, key map, Arabic typography, RTL checklist.
- `references/assistant-rag.md` — how the chat endpoint works, knowledge chunks, tuning retrieval and the prompt.
- `references/deploy-and-secrets.md` — GitHub + Vercel steps, env vars, key rotation, troubleshooting.
