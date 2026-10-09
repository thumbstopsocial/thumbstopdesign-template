# ThumbStop client site

Built from the ThumbStop template. Next.js (App Router), React, Tailwind 4, TypeScript, Resend, Upstash Redis, Vercel.

@AGENTS.md

## Sources of truth
- `design/deck.html` is the only design and copy source. Build what it shows; don't invent sections or styles.
- `client.config.ts` is the only source for pages, nav, SEO titles and descriptions, redirects, form fields and recipients, and business details. Never hard-code any of these.
- `design/assets/` holds the real files. Import images statically from there and render with `next/image`.

## Where things go
- `components/system/` is plumbing: consent, analytics, form behaviour. Never restyle or rewrite it per client.
- `components/site/` is where the design lives: header, footer, consent banner, contact form, legal page, sections and `pages/index.tsx` (one entry per config page, keyed by path).
- `styles/tokens.css` holds the deck's CSS variables, mapped into Tailwind with `@theme`. Fonts go in `components/site/fonts.ts`.
- Pages are served by `app/[[...slug]]/page.tsx`. To add a page: add it to the config, then its component to `components/site/pages`. Never add a page folder under `app/` by hand.
- Privacy and terms are generated from the config (`lib/legal.ts`). Restyle `components/site/LegalPage.tsx`, don't rewrite the words.

## Rules that the design must keep
- Contact form: keep the `name` attributes, the honeypot from `useContactForm`, and the success and error messages. Pass `publicForm` from a server component.
- Cookie banner: position fixed, Accept and Reject given equal weight, link to /privacy. Keep the Cookie settings button in the footer.
- Footer: links to privacy and terms, legal name and company number.
- One `h1` per page. Every image has meaningful alt text, or `alt=""` if decorative.
- Embeds (booking, video, maps) need their domains added under `csp` in the config.

## Copy
British English. No em dashes. None of the banned phrases in `lib/copy-rules.ts`. Use the deck's copy word for word.

## Checks
All checks are scripts. Run them; don't review by reading the code.
- `npm run build` runs lint and the site check first.
- With the site running (`npm run start`): `check:copy`, `check:headers`, `check:redirects`, `check:links`, `check:a11y`, `check:lighthouse`, each with `--url http://localhost:3000` or `BASE_URL` set.
- When a check fails, fix only what it reports.

## Git
Work on a branch. Never push to or merge into `main`; a hook asks for confirmation if you try.
