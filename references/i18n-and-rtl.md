# i18n and RTL

Two locales, `en` and `ar`, via `react-i18next` (`src/i18n/index.js`). The language is saved in `localStorage.lang`; `Site.jsx` sets `html[lang]` and `html[dir]` on every change. The theme (`localStorage.theme`) is applied by an inline script in `index.html` before paint.

## Locale key map (identical in both files)

| Namespace | Contents |
|---|---|
| `ed.nav.*` | nav labels, menu/close, theme + language, skip link, music and SFX labels |
| `ed.hero.*` | kicker, role, statement, CTAs, meta labels/values (`based`, `exp`, `stack`, `status`) |
| `ed.about.*` | `label`, `pre` + `em` + `post` (the statement; `em` is highlighted), `portrait` caption, `stats[]` (`{v,l}` ×4), `what` |
| `ed.work.*` | `label`, `title`, `count` (`{{n}}`), `hint`, open/live/private labels, `kind`, `kinds[]` (type per project), `next`, `prev` |
| `ed.stack.*`, `ed.experience.*`, `ed.contact.*`, `ed.footer.*` | headings and form/validation text; footer `rights` takes `{{year}}` |
| `about.highlights[]` | six `{title,text}` tiles |
| `skills.categories[]` | three column titles for the stack |
| `experience.items[]` | `{period, role, company, description, achievements[]}` |
| `projects.items[]` | per project `{subtitle, description, labels[]}` — index = `i18nIndex` |
| `ai_chat.*` | assistant UI text, quick-question chips and the questions they send, error messages |
| `lang_label` | text of the language switch button (the *other* language) |

Rules: both files must have the same keys and the same array lengths. Keep technology and project names in English in both languages. Don't reorder the arrays — change `order` / `i18nIndex` in `projectsMeta.js` instead.

## Arabic typography

- Font Cairo, weights 700–900 for display; **no letter-spacing** and **no uppercase** (tracking breaks letter joining). A global rule enforces `letter-spacing:0` under `html[lang=ar]`.
- Larger line-heights (1.15–1.7) than Latin; headings `line-height ≈ 1.2`.
- Split hero text per **word**, never per letter.
- Mixed Arabic + English tech names can reorder visually (e.g. "Next.js وNode.js"). Prefer separators: `Next.js · Node.js · Express`.
- Wrap numbers/counters and emails/URLs in `dir="ltr"`.

## RTL checklist

- Use logical properties: `margin-inline`, `padding-inline`, `inset-inline-start/end`, `text-align:start`, `border-inline-*`. Avoid `left/right` unless intentionally physical.
- Mirror arrows: `.nb-arrow` and the case-overlay Prev/Next glyphs flip under `[dir=rtl]`; directional hover offsets (`translateX`) are negated in RTL rules.
- Grid/flex order flips automatically; verify the two-column hero, about grid, and contact grid.
- Test the overlay's keyboard arrows (ArrowRight = Previous in RTL).
- Check the sticker, portrait offset block and nav at 375px in RTL.
