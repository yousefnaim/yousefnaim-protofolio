# Interaction, motion, and sound

## Reveal system (`Site.jsx`)

Elements with `data-reveal` start at `opacity:0`. One `IntersectionObserver` sets the attribute `data-in` when they enter the viewport; a `MutationObserver` picks up elements that mount later (lazy sections).

**Why an attribute and not a class:** React owns `className`. When a component re-renders (hover state, accordion open), React rewrites the class string and wipes any class added by the observer — items would vanish. Attributes are untouched. Never switch this to `classList`.

Stagger with `style={{'--d':'0.1s'}}`; initial tilt with `--r0`.

## Scroll

Lenis (`window.__lenis`) drives smooth scroll; `scrollToId()` (in `src/brutal/data.js`) uses it for nav anchors. Any element that must scroll natively (case overlay, mobile sheet, chat list) needs `data-lenis-prevent`. When an overlay opens, the code also calls `__lenis.stop()` and locks `html` overflow, and restores both on close.

## Hover and press

- Lift on hover, press on active: buttons, cards, tiles. Touch devices (`@media (hover:none)`) skip the lift.
- Hero name: each Latin letter is `span.nb-ch[data-n]`; Arabic splits by **word** (`span.nb-wd`) so letters keep joining.
- Marquee (`.nb-ticker`) pauses on hover; the rotating sticker and EQ bars are CSS-only.
- `prefers-reduced-motion` disables animations and forces reveal elements visible.

## Case-study overlay (`Work.jsx`)

framer-motion spring slide-up. Top bar: counter (`dir="ltr"` so "01 / 06" never flips), **Previous**, **Next**, **Close**. Keyboard: `Esc` closes; arrow keys navigate and are direction-aware (`document.dir`). Focus moves to Close on open and returns to the opener on close. Keep `role="dialog" aria-modal`.

## Music (`ambient.js` + `MusicButton.jsx`)

Generative loop, no files: 124 BPM, chords Am→F→C→G; four-on-the-floor kick, off-beat hats, claps on 2 and 4, saw bass, square arpeggio with a dotted-eighth echo, chord stabs; a compressor on the master. Scheduling uses a look-ahead timer (`setInterval` 80ms, schedules 0.35s ahead) on a 16th-note grid.

- Starts only on a user click (browser autoplay policy). If the visitor left it on, it resumes on their first pointer/keyboard/touch gesture.
- Fades in/out on the master gain; suspends in hidden tabs; preference saved in `localStorage` (`music`).
- Tuning: change `BPM`, `ROOTS`/`CHORDS` (MIDI notes), `BASS_STEPS`, master gain in `start()` (0.5). To make it calmer lower the BPM, drop `kick` and `clap`, and lengthen the envelopes. Keep it in the same key as `sfx.js` (A minor pentatonic).

## Sound effects (`sfx.js` + `SfxButton.jsx`)

- `attachSfx(document)` installs delegated `pointerover`/`pointerdown`/`keydown` listeners once (in `Site.jsx`). Audio unlocks on the first gesture.
- Letters/words → bell notes from `SCALE` indexed by `data-n` (moving across the name plays a melody). Controls (`BTN` selector) → soft tick. Blocks (`BLOCK` selector) → low pluck. Click on controls/cards → two-note pop.
- Hover sounds are mouse-only; touch gets click sounds only. Throttled (30–80ms). Preference key `sfx`.
- To add sound to a new element, add its selector to `BTN` or `BLOCK` in `sfx.js`; to make a new text element musical, give it `data-n`.

Keep levels low (SFX bus gain 0.4, music master 0.5) and always ship both toggles.
