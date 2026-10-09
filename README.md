# ThumbStop site template

The plumbing every ThumbStop site shares: security, forms, consent and analytics, SEO, redirects, health checks and CI. No visual style. Each client's design is built on top from their signed-off deck.

Client repos are created from this template by the setup script in the studio repo. Don't fork it by hand.

## The three inputs

| File | What it holds |
|---|---|
| `design/deck.html` | Design, copy, tokens and build notes, from Claude Design |
| `client.config.ts` | Pages, SEO, redirects, form, business details, GTM ID |
| `design/assets/` | Photos, logo SVG, favicon, licensed fonts |

## How it's laid out

- `app/[[...slug]]/page.tsx` serves every config page. Page bodies live in `components/site/pages`, keyed by path.
- `app/privacy`, `app/terms`: generated from the config by `lib/legal.ts`.
- `app/api/contact`: validation, honeypot, minimum fill time, rate limit, Resend.
- `app/api/health`: weekly health check and monthly client report, run by Vercel cron.
- `components/system/`: consent, analytics and form behaviour. Never restyled.
- `components/site/`: the design. Ships as unstyled placeholders that pass every check.
- `next.config.ts`: security headers and redirects from the config.

## Checks

| Command | Needs a running site | Fails when |
|---|---|---|
| `npm run check:site` | No (runs before every build) | Config invalid, page and registry out of step, broken redirect, missing asset |
| `npm run typecheck`, `npm run lint` | No | Any error |
| `npm run check:copy` | Yes | Em dash, banned phrase, American spelling |
| `npm run check:headers` | Yes | A security header missing |
| `npm run check:redirects` | Yes | An old path doesn't land on its new page |
| `npm run check:links` | Yes | A broken internal or external link |
| `npm run check:consent` | Yes | Consent defaults not denied, or the banner doesn't store the choice |
| `npm run check:a11y` | Yes | Any serious or critical axe issue at 1280px or 390px |
| `npm run check:lighthouse` | Yes | Below 90 performance, 95 accessibility, 95 best practice, 100 SEO |
| `npm run check:form` | Yes | The contact form doesn't submit |
| `npm run qa:screenshots` | Yes | Not a check: screenshots for `/qa` |

Scripts that need a site take `--url <base>` or `BASE_URL`. Locally: `npm run build && npm start`, then `BASE_URL=http://localhost:3000 npm run check:copy`.

CI (`.github/workflows/ci.yml`) runs all of it on every PR against a local build. Once Vercel deploys the preview, `preview.yml` runs the form, headers and redirect checks against it.

## Environment variables

See `.env.example`. All real values live in Vercel and are set by the studio setup script. Previews also need `RESEND_TEST_RECIPIENT=delivered@resend.dev`, so form tests never reach the client.

## One-off setup for this template repo

- Settings, General: tick **Template repository** and **Allow auto-merge**.
- Branch protection on `main` for every client repo (the setup script does this): require the `checks` and `preview` jobs to pass, require a PR.
- Repo secret `VERCEL_AUTOMATION_BYPASS_SECRET` so CI can reach protected previews.

## Changing the template

Fix things here, not in client repos. A fix made once here applies to every build after it. Existing client repos pick it up by hand when worth it.
