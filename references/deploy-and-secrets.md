# Deploy, secrets, and troubleshooting

## GitHub

```bash
git init && git add -A && git commit -m "Initial portfolio"
gh repo create <name> --private --source=. --remote=origin --push   # or create it in the web UI
```

Keep large originals (raw PNG screenshots) out of the repo; commit only the WebP versions.

## Vercel

1. Import the repo at `vercel.com/new` (framework preset **Vite**). `vercel.json` already sets `npx vite build`, output `dist`, and the SPA rewrite so deep links work.
2. Add environment variables (Project → Settings → Environment Variables, **Production** at least):
   - `GEMINI_API_KEY` — only if you deploy the assistant. **Not** `VITE_…`.
   - `VITE_API_URL` — only if you have a separate backend; leave unset otherwise (the site uses its local data and makes no API calls).
3. Deploy. Every push to the production branch redeploys automatically. Other branches get preview URLs.
4. A project name that is already taken by someone else gets a suffix (e.g. `name-xyz.vercel.app`). Add the short domain under Settings → Domains, or accept the generated one.
5. **Deployment Protection:** Vercel enables "Vercel Authentication" on some projects, which makes the site ask visitors to log in. For a public portfolio turn it off (Settings → Deployment Protection).

CLI alternative: `npx vercel link`, `npx vercel deploy --prod`. Use a `.vercelignore` (included) to keep `dist`, `node_modules` and `.env` out of uploads.

## Secrets rules

- Server-only secrets: never prefix with `VITE_`, never commit them, never paste them in chat or issues. If a key was ever exposed, **create a new one, update Vercel, redeploy, then delete the old key at the provider** — removing it from Vercel alone does not revoke it.
- Restrict keys at the provider where possible (HTTP referrer / API restrictions) and set a usage cap.
- EmailJS service/template IDs and the *public* key are designed to be in client code; keep the private key out.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Assistant says it's unavailable, `/api/chat` returns `{"error":"no_key"}` | `GEMINI_API_KEY` missing for that environment, or the deployment predates the variable → add it and redeploy |
| `/api/chat` returns `502 request` | Check `vercel logs`; usually a model name that no longer exists, a quota error, or temporary overload (503) |
| Browser asks "access other apps and services on this device" | The site calls `http://localhost…`. Remove localhost defaults; call APIs only when their URL env var is set |
| Site asks visitors to sign in to Vercel | Deployment Protection (see above) |
| Deep link `/anything` is a 404 | `vercel.json` rewrite missing |
| Upload too large / slow | Add large unused files to `.vercelignore`; convert images to WebP |
| Mouse wheel doesn't scroll inside an overlay | Add `data-lenis-prevent` to that element |
| Sections invisible after interaction | Reveal state was moved to a class; keep `data-in` |
| Domain still shows an old build | A manually-set alias doesn't follow new deploys; add the domain to the project, or connect Git so production deploys re-alias automatically |

## Release checklist

`npx vite build` ✔ · light/dark ✔ · EN/AR ✔ · 375px & 1440px ✔ · case overlay Prev/Next/Esc/scroll ✔ · sounds + toggles ✔ · assistant answers contact/projects and refuses unknown facts ✔ · no secrets in the repo (`git grep -nE "AIza|AQ\\.|sk-|key"`) ✔ · Deployment Protection off ✔.
