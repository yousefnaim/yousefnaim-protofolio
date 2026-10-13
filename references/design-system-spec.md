# Design system specification (exact values)

This is the authoritative spec of the look. Every value here is what `assets/src/brutal/brutal.css` implements. If you change a value, change it in the CSS tokens/rules and update this file.

## 1. Principles

1. **Flat and loud.** Saturated flat color fills; no gradients, blur, glow, glass, or drop-shadow filters.
2. **Structure is drawn.** Every surface has a visible 3px border; depth is a *solid offset shadow* (no blur).
3. **Physical interaction.** Things lift toward you on hover (shadow grows), and press into the page on click (shadow disappears).
4. **Controlled chaos.** Cards and stickers are tilted a little (±0.6–2°) and straighten or flip on hover; text and layout stay strictly aligned to a grid.
5. **Two themes, one palette.** Saturated colors never change between light and dark; only neutral surfaces and the line color flip.
6. **Text contrast is non-negotiable.** Text on a saturated fill is `#111`; neutral surfaces use theme tokens.

## 2. Color

### 2.1 Palette (constant in both themes)

| Token | Hex | Role | #111 text contrast |
|---|---|---|---|
| `--nb-yellow` | `#ffd600` | primary brand, hero, active state, tags, "highlight" marks, CTAs | 13.4 : 1 |
| `--nb-pink` | `#ff6b9d` | accent, hover, offset blocks, text-shadow on big titles, primary buttons | 7.1 : 1 |
| `--nb-blue` | `#5b8cff` | work section background, stat tile, focus ring | 6.0 : 1 |
| `--nb-green` | `#3ddc84` | status (live dot, "now" badge), success, stat tile, stack column 1 | 10.6 : 1 |
| `--nb-orange` | `#ff8a3d` | secondary highlight tile, stack column 3 | 8.1 : 1 |
| `--nb-lilac` | `#c3b1ff` | experience section background, stack column 2 | 9.9 : 1 |
| `--nb-black` | `#111111` | borders on saturated fills, tag backgrounds, footer, ticker | — |

Error color: `#d6002f` (text/borders/shadow on invalid fields). Error background tint: `#ffd9d9`.

### 2.2 Neutrals (flip with theme)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--nb-paper` | `#fffdf5` | `#151515` | page background |
| `--nb-paper2` | `#f3eedd` | `#1e1e1e` | inset surfaces (list items, image placeholders) |
| `--nb-card` | `#ffffff` | `#242424` | cards, nav bar, buttons, inputs' surroundings |
| `--nb-text` | `#111111` | `#f5f1e6` | body text on neutral surfaces |
| `--nb-mute` | `#4d4a42` | `#b5b0a2` | secondary text (8.7 : 1 / 8.4 : 1) |
| `--nb-line` | `#111111` | `#f5f1e6` | borders and offset shadows on neutral surfaces |

Dark theme is activated by `html[data-theme='dark']`; the default for new visitors is **light**. All neutral/contrast pairs are ≥ 8 : 1.

### 2.3 Where each color goes (mapping)

| Element | Fill | Text | Border / shadow |
|---|---|---|---|
| Page | `--nb-paper` | `--nb-text` | — |
| Hero section | yellow + 22px dot grid (`#11111122`) | `#111` | — |
| Hero name | — | `#111` | `text-shadow: 6px 6px 0 pink` (4px on mobile); letter hover → white + `6px 6px 0 #111` |
| Statement / note cards on color | white | `#111` | `3px #111` + `7px 7px 0 #111` |
| Meta list (hero) | pink | `#111` | `3px #111`, `8px 8px 0 #111`, tilt `1.6°` |
| Work section | blue | `#111` | cards = `--nb-card` with `3px --nb-line` + `8px 8px 0 #111` |
| Card top strip | cycles yellow, pink, green, lilac, orange, yellow | `#111` | `3px` bottom |
| Experience section | lilac | `#111` | cards `8px 8px 0 #111` |
| Contact section | pink | `#111` | white panels, `7–9px` shadows, yellow mark/mail block |
| Stat tiles (4) | green, orange, lilac, blue | `#111` | `3px #111`, `5px 5px 0 #111` |
| Highlight tiles (6) | yellow, pink, blue, green, lilac, orange | `#111` | same; tiny black number tag top-right |
| Stack columns (3) | green, lilac, orange | `#111` | `8px 8px 0 #111`, tilts `-1°, 0.8°, -0.6°` |
| Tags / sticker labels | `#111` bg | yellow or white | — |
| Nav active link | yellow | `#111` | `2px #111` |
| Nav link hover | pink | `#111` | `2px #111`, tilt `-2°`, `translateY(-2px)` |
| Toggle ON (music/SFX) | pink | `#111` | `2px #111` |
| Footer | `#111` | `#f5f1e6` | — |
| Focus ring | — | — | `3px solid --nb-blue`, offset 3px |

## 3. Typography

| Role | Family | Weight | Case | Tracking | Line-height |
|---|---|---|---|---|---|
| Display (h1/h2, card titles) | Bricolage Grotesque | 800 | UPPERCASE (h1/h2), sentence/title case (card titles) | `-0.03` to `-0.045em` | 0.86–1.05 |
| Body | Space Grotesk | 400–700 | normal | 0 | 1.5 |
| Labels (`.nb-mono`) | JetBrains Mono | 500 | UPPERCASE | `+0.04em` | — |
| Arabic (all roles) | Cairo | 700–900 display, 500–700 body | none | **0** | 1.15–1.7 |

Fluid sizes (`clamp(min, vw, max)`):

| Element | Size |
|---|---|
| Hero name | `clamp(64px, 13.5vw, 210px)` (Arabic `14.5vw / 220px`) |
| Case-study title | `clamp(44px, 9vw, 140px)` |
| Contact title | `clamp(52px, 11.5vw, 180px)` |
| Section h2 | `clamp(44px, 8.5vw, 124px)` |
| About statement | `clamp(26px, 3.6vw, 52px)` |
| Card title | `clamp(26px, 2.6vw, 38px)` |
| Hero statement | `clamp(20px, 2.1vw, 30px)` |
| Stat value | `clamp(26px, 3vw, 44px)` |
| Body | 17px (16px ≤ 720px) |
| Labels | 13px (Arabic 14px, weight 700) |

## 4. Shape, border, shadow, tilt

- **Radius:** none (square). The only round things are dots, the sticker, and the live indicator (`50%`).
- **Border:** `--nb-b: 3px`. Small controls (pills, chips, tags) use `2px`. Dashed `3px` for the experience divider.
- **Shadow scale** (always `x y 0 color`, x = y):
  `3px` chips/hover-pressed · `4px` small chips · `5px` buttons/tiles/nav · `6px` default `--nb-sh` · `7px` note cards · `8px` section cards · `9–10px` forms/images · `11–14px` hover state of the above.
  Hover adds **+3px**; active sets it to **0** and moves the element by `translate(5px, 5px)`.
- **Tilt vocabulary:** `±0.6°–0.8°` large cards, `±1°–1.6°` panels and notes, `±2°` tags/stickers, `-4°…-6°` small badges. Hover straightens (or swings the other way) and lifts `translate(-3px…-5px)`.

## 5. Spacing and layout

| Token | Value |
|---|---|
| Content width | `max-width: 1380px`, side padding `clamp(18px, 4vw, 48px)` |
| Section padding | `padding-block: clamp(64px, 9vw, 128px)`, `3px` top border between sections |
| Grid gaps | `clamp(22px, 3vw, 40px)` cards · `clamp(28px, 5vw, 80px)` about · `clamp(24px, 4vw, 64px)` hero · `14–18px` tiles · `6–12px` chips |
| Nav | fixed, height 56px bar inside a 76px offset (`--nb-nav-h`), top gap 12px; never hides |
| Work grid | 2 columns; even cards offset down 38px (stagger) |
| Hero | 7 : 5 two-column grid |
| About | 4.4 : 7.6 columns; portrait is `position: sticky` |

### Breakpoints

| Query | Changes |
|---|---|
| `max-width: 1000px` | nav links hide → burger + full-screen sheet; all two-column grids become one; portrait un-sticks; work grid 1 column; stack 1 column |
| `max-width: 720px` | 16px base; stat tiles 2 columns; highlight tiles 1 column; smaller shadows/gaps; pill padding reduced; music label hidden |
| `max-width: 560px` | case-study top bar stacks |
| `hover: none` | no hover lift on cards |
| `prefers-reduced-motion` | animations off, reveal elements visible, ticker/sticker static |

## 6. Motion

| Token | Value | Used for |
|---|---|---|
| `--nb-ease` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (springy overshoot) | lifts, tilts, hover, letter jumps |
| Button / small hover | `0.18s` transform + shadow | buttons, pills |
| Card / tile hover | `0.2–0.3s` | cards, stats, tiles |
| Reveal | `0.55s` opacity, `0.7s` transform; starts `translateY(34px) scale(.97) rotate(var(--r0))`; stagger via `--d` | scroll-in |
| Loader / sheet slide | `0.5–0.7s cubic-bezier(0.7, 0, 0.2, 1)` | loader exit, mobile menu |
| Accordion | `grid-template-rows 0.45s ease` | experience |
| Ambient loops | blink `1.2s steps(2)` · sticker spin `14s linear` · ticker `30s linear` · EQ bars `0.9s` | decoration |
| Overlay | framer-motion spring `stiffness 260, damping 30` | case study |

Animate only `transform` and `opacity` (plus the grid-rows accordion).

## 7. Z-index scale

`1` ticker/figures · `2` stickers · `3` overlay bar · `999` mobile sheet · `1000` nav · `1100` scroll progress · `1500` chat · `2000` case overlay · `3000` skip link · `4000` loader.

## 8. Components (anatomy and states)

- **Button `.nb-btn`:** padding `14px 22px`, weight 700, 3px border, `5px` shadow. Hover `translate(-3,-3)` + `8px`. Active `translate(5,5)` + `0`. Variants fill pink or yellow with `#111` text/border. Disabled: opacity .6, `cursor: wait`.
- **Pill `.nb-pill`:** `7px 11px`, 2px border, weight 700 14px; hover → green fill, `translateY(-2px)`.
- **Chip `.nb-chip`:** inline-flex, 2px border, `4px 10px`; `--fill` is yellow.
- **Card `.nb-card`:** column flex; top strip (color, 3px bottom border, number tag), 16:10 cover image (`object-fit: cover; object-position: top`), body with title/subtitle/tags/"open" row; hover lifts `-5px` with a `14px` shadow and scales the image `1.08` with a `-1°` tilt.
- **Section head `.nb-head`:** black tag (yellow text, tilted `-2°`) with number + label; giant uppercase h2; aside note card tilted `1.5°`.
- **Form field `.nb-field`:** label above, 3px bordered input on `--nb-paper`; focus → white background, `5px` blue offset shadow, `translate(-2,-2)`; error → red border/shadow + red message below.
- **Overlay `.nb-case`:** yellow sticky bar; title with `6px 6px 0` pink text-shadow; black tilted subtitle tag; three colored info tiles (green, lilac, orange); description card with `8px` shadow; screenshots with a black caption tab overlapping the frame and `10px` shadow; pink "Next project" card.
- **Loader:** yellow screen, white card tilted `-1.5°` with a `10px` shadow, 28px-high progress bar (pink fill with a 3px right border).

## 9. Imagery and icons

- Screenshots are shown full-bleed inside the border (never rounded), `object-fit: cover; object-position: top` for covers, natural height in the overlay, with the same offset shadow as cards.
- The portrait is a 4:5 crop in a tilted frame with a pink offset block behind it (`14px` offset) and a yellow sticker badge.
- Icons: none from icon fonts — use Unicode glyphs (`→ ↗ ✦ ✕ ↑`) and tiny inline SVG for the speaker. Arrows flip in RTL.

## 10. Accessibility numbers

- All text/background pairs listed above are ≥ 6 : 1 (most > 8 : 1).
- Focus: `3px` blue outline, offset `3px`, on every interactive element.
- Targets: nav pills ≥ 36px tall; mobile menu rows ≥ 56px.
- Never convey state by color alone: toggles also change the icon/EQ animation and `aria-pressed`.

## 11. Extending the system

New element checklist: pick a palette color and keep text `#111` on it · 3px border · solid offset shadow from the scale · tilt ≤ 2° · hover = lift +3px · active = press · use `--nb-ease` · RTL logical properties · reveal via `data-reveal` · reduced-motion safe.
