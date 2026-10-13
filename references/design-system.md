# Design system

All CSS is in `assets/src/brutal/brutal.css`, scoped under `.nb`. Prefix every class with `nb-`.

> The complete, exact specification (every value and its rationale) is in `design-system-spec.md`. This file is the practical companion: class catalog, section recipes, and how to extend.

## Tokens (declared on `.nb`)

```css
/* colors — saturated, flat, never gradients */
--nb-yellow:#ffd600; --nb-pink:#ff6b9d; --nb-blue:#5b8cff; --nb-green:#3ddc84;
--nb-orange:#ff8a3d; --nb-lilac:#c3b1ff; --nb-black:#111;

/* neutral surfaces — these flip in dark mode */
--nb-paper:#fffdf5; --nb-paper2:#f3eedd; --nb-card:#fff; --nb-text:#111; --nb-mute:#4d4a42; --nb-line:#111;
/* html[data-theme=dark] .nb */
--nb-paper:#151515; --nb-paper2:#1e1e1e; --nb-card:#242424; --nb-text:#f5f1e6; --nb-mute:#b5b0a2; --nb-line:#f5f1e6;

--nb-b:3px;  --nb-sh:6px;  --nb-nav-h:76px;
--nb-display:'Bricolage Grotesque'; --nb-body:'Space Grotesk'; --nb-mono:'JetBrains Mono';
--nb-ease:cubic-bezier(.34,1.56,.64,1);   /* springy overshoot used for lifts */
```

`.nb` also maps `--ed-*` tokens (`--ed-bg`, `--ed-ink`, `--ed-accent`, …) onto the `--nb-*` ones — the assistant panel in `src/style.css` reads those. Don't rename them.

### Recoloring

Change only the six saturated colors and the paper tone; keep contrast: text on saturated fills stays `#111` (`.nb-fix`). The section rhythm (which section gets which color) lives in each section's rule: `.nb-hero` (yellow), `.nb-work` (blue), `.nb-exp-sec` (lilac), `.nb-contact` (pink), `.nb-footer` (black). Stat tiles, highlight tiles and stack columns cycle through the palette with `:nth-child`.

### Typography

| Use | Font | Notes |
|---|---|---|
| Display / headings | Bricolage Grotesque 800 | uppercase, `letter-spacing:-.04em`, `line-height:.86–1.05` |
| Body | Space Grotesk 400–700 | 16–17px |
| Labels (`.nb-mono`) | JetBrains Mono 500 | 13px, uppercase, `letter-spacing:.04em` |
| Arabic (all roles) | Cairo 700–900 | `html[lang=ar] .nb *{letter-spacing:0!important}`, no uppercase |

## Primitives

- `.nb-box` — card with 3px border + `6px 6px 0` shadow.
- `.nb-chip` / `.nb-chip--fill` — small bordered tags (yellow when filled).
- `.nb-btn` (+ `--pink`, `--yellow`) — hover lifts `translate(-3px,-3px)` with a bigger shadow; `:active` presses to `translate(5px,5px)` with no shadow.
- `.nb-pill` — compact bordered control (theme, language, music, SFX, menu).
- `.nb-head` — section header: `.nb-head__tag` (black tilted tag with number + label), `<h2>` (giant uppercase), `.nb-head__aside` (tilted note card).
- `[data-reveal]` + `[data-reveal][data-in]` — pop-in; `--d` sets delay, `--r0` the initial tilt.

## Section recipes

| Section | Root class | Layout |
|---|---|---|
| Loader | `.nb-loader` | yellow screen, white tilted card, pink progress bar, slides up when done |
| Nav | `.nb-nav` > `.nb-nav__bar` | fixed, floating bar with border + shadow; `.nb-link.active` is yellow; `.nb-sheet` is the mobile full-screen menu |
| Hero | `.nb-hero` | 7/5 grid: giant name (`.nb-hero__name`, text-shadow offset in pink), statement card, CTAs; right: `.nb-meta` list, `.nb-big-stat`, rotating `.nb-stick` badge; `.nb-ticker` marquee strip below |
| About | `#about` | portrait with tilted frame + pink offset block (`.nb-portrait`), `.nb-statement` with a `<mark>` highlight, `.nb-stats` (4 tiles), `.nb-what` (6 highlight tiles) |
| Work | `.nb-work` | 2-column `.nb-work__grid` of `.nb-card` (even cards offset down 38px); card = colored top strip, cover image, title, tags, "open" arrow |
| Case study | `.nb-case` | fixed overlay: yellow bar (counter, Prev, Next, Close), huge title with pink shadow, colored info tiles, big description card, screenshot list (`.nb-shot` with caption tab), pink "Next project" card |
| Stack | `#stack` | three colored columns of white list items, plus tilted tool chips |
| Experience | `.nb-exp-sec` | accordion `.nb-exp__item` with `.nb-plus` toggle and a dashed-border details panel |
| Contact | `.nb-contact` | giant title with a yellow tilted `<mark>`; text card, big mail link, Copy/WhatsApp buttons; tilted white form with bordered fields |
| Footer | `.nb-footer` | black bar: rights, local clock, links, "back to top" |
| Assistant | `.nb-chat` | fixed bottom corner; skin in `src/style.css` (square, hard shadow) |

### Adding a new section

1. Create `src/brutal/MySection.jsx` using `<section id="my" className="nb-section ...">` and `<SectionHead no={n} label=… title=… aside=… />` from `About.jsx`.
2. Give it a background color class in `brutal.css` (pick the next color in the rhythm) and add `data-reveal` to blocks.
3. Lazy-import it in `Site.jsx` inside the `<Suspense>` group, add its id to `ITEMS` in `Nav.jsx`, and add `ed.nav.my` to both locale files.
4. Use logical properties and test RTL.

### Do / Don't

- Do tilt things a little, use solid shadows, keep borders constant at 3px, make hover feel physical (lift, then press).
- Don't add gradients, blur, glow, drop-shadow filters, rounded-pill everything, or more than the six palette colors.
- Don't put theme-flipping text on saturated fills; use `#111`.
- Don't animate layout properties; use `transform`/`opacity`.
