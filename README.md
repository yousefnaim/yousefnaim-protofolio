# yousefnaim-protofolio — neo-brutalist portfolio kit

A Claude Code skill + a complete React/Vite portfolio template: thick borders, hard shadows, flat colors,
EN/AR (RTL), light/dark, case-study overlay, generative music and hover sounds, and an optional
server-side RAG chat assistant for Vercel.

## Install the skill

```bash
git clone https://github.com/yousefnaim/yousefnaim-protofolio ~/.claude/skills/yousefnaim-protofolio
```

On Windows clone into `C:\Users\<you>\.claude\skills\yousefnaim-protofolio`, or download the ZIP from GitHub
(Code → Download ZIP) and unzip it there so that `SKILL.md` sits directly inside that folder.

Start a new Claude Code session; the skill appears as `yousefnaim-protofolio` and is used automatically when you
ask for a portfolio in this style. You can also use `assets/` on its own without Claude — it is a normal Vite project's `src/`.

## Folder map

```
SKILL.md                 how the skill works + rules
references/              design-system-spec (exact values), design-system (recipes), interaction & sound, i18n/RTL, assistant (RAG), deploy & secrets
assets/                  the kit: src/, api/, index.html, vite.config.js, vercel.json, package.deps.json
```

## Use the kit by hand

1. `npm create vite@latest my-site -- --template react`, then install the packages in `assets/package.deps.json`.
2. Copy `assets/*` into the project (merge `src/`), delete the template's default CSS.
3. Edit `src/data/siteFacts.js`, `projectsMeta.js`, `projectImages.js` and the two locale files; add your photo at
   `src/Imgs/portrait.jpg` and screenshots in `public/projects/`.
4. `npm run dev`, then `npx vite build`.

No personal data, keys, or accounts are included. The Gemini key (if you use the assistant) goes in the
`GEMINI_API_KEY` environment variable on your host — never in the repo and never with a `VITE_` prefix.
