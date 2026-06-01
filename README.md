# VezVision website

Production Vite + React + TypeScript website for VezVision. The app uses Supabase for CMS/public data, Supabase Edge Functions for contact/newsletter flows, Sentry and Google Analytics behind cookie consent. Static build (`dist/`) is uploaded to hosting (e.g. Hostido); security headers can be set in the panel or via `vercel.json` as a reference.

## Stack

- React 18, React Router 7, Vite 6, TypeScript strict mode
- TanStack Query for public settings cache/invalidation
- Supabase client + Edge Functions
- Vitest + Testing Library for unit/regression tests
- Playwright for desktop/mobile smoke tests
- ESLint flat config with type-aware TypeScript and accessibility rules

## Required environment

Create `.env` from `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_GA_ID=G-XXXXXXXXXX
```

Only `VITE_*` values are exposed to the browser. Supabase service-role keys, Resend keys, and webhook secrets belong only in Supabase Edge Function secrets.

## Development

```bash
npm ci
npm run dev
```

The local dev server runs on port `5174`.

## Quality gates

Run the same checks used by CI:

```bash
npm run check
npm run lint
npm run test:unit
npm run build
npm audit --audit-level=moderate
npm run test:e2e
```

Install Playwright browsers before the first E2E run:

```bash
npx playwright install chromium
```

## Security model

- TypeScript strict mode is enabled.
- Arbitrary CMS script/style injection is not allowed. `CodeInjector` only accepts non-executable `meta` and allowlisted `link` tags in `<head>`, and sanitized non-script body markup.
- Legacy service workers are unregistered at startup; there is no custom cache-first service worker.
- Analytics and Sentry initialize only after analytics consent.
- Edge functions validate public input server-side and force trusted server-side defaults such as contact message status.
- Dependency audit is part of CI.

### CMS analytics migration

Do not put Google Tag Manager, Meta Pixel, or other executable snippets in `code_injection.head` or `code_injection.body`. They are stripped by design.

Use instead:

- Google Analytics: set `VITE_GA_ID` and rely on cookie-consent gating in `src/lib/googleAnalyticsConsent.ts`.
- Sentry: set `VITE_SENTRY_DSN` and consent handling in `src/lib/sentryConsent.ts`.
- Domain verification / SEO tags: safe `<meta>` and allowlisted `<link rel="canonical|icon|…">` entries in `code_injection.head`.

### Maintenance mode

When maintenance is enabled in `vv_site_settings`, the public app calls `check-maintenance-access` on every cold load (and whenever maintenance settings change). The edge function is the **source of truth** for whether maintenance is active and whether the visitor IP is allowlisted.

Production origins (`https://vezvision.com`, `https://www.vezvision.com`) are already allowlisted in `supabase/functions/_shared/cors.ts`. On Hostido you normally **do not** need `ALLOWED_CORS_ORIGINS` if the public site is served from those domains.

Set the optional Edge secret `ALLOWED_CORS_ORIGINS` (comma-separated full origins) only for **extra** hosts, for example a staging subdomain, a temporary Hostido URL, or an alternate domain:

`https://staging.vezvision.com,https://twoja-domena.hostido.pl`

To discover the IP seen by Supabase, inspect function logs while loading the site. If the header is missing, the value is `unknown` and must be added to `allowedIps` exactly.

If the edge function is unreachable while maintenance is **disabled** in CMS, the site stays online (logs `maintenanceAccess.invoke`). If maintenance is **enabled** in CMS but edge cannot be reached, the site fails closed so a work-in-progress deploy stays protected.

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`.

It runs install, typecheck, lint, unit tests, production build, npm audit, and Chromium Playwright smoke tests.

## Supabase Edge Functions (public site)

| Function | Purpose |
|----------|---------|
| `check-maintenance-access` | Maintenance gate + IP allowlist |
| `submit-contact` | Contact form → DB + Resend |
| `subscribe-newsletter` | Newsletter signup via `safe_insert_newsletter_subscriber` |
| `unsubscribe-newsletter` | Token unsubscribe via `unsubscribe_by_token` |

Deploy from `supabase/functions/` (shared `_shared/cors.ts`, `_shared/clientIp.ts`). Apply DB migrations before deploying when RPC signatures change.

## Deployment notes

- Build: `npm run build` → upload contents of `dist/` to Hostido (or your static host). Include `public/.htaccess` (SPA fallback + CSP). Do not commit `dist/`.
- Configure HTTPS in the Hostido panel. `vercel.json` is optional reference only if you are not on Vercel.
- Edge Functions CORS: browser calls from your live domain use the hardcoded production origins; local dev uses ports `5174` / `4173`.
- Use **npm** (`npm ci`) for installs; do not commit alternate lockfiles.
- Keep Browserslist data current with `npm update caniuse-lite browserslist` when build warnings appear.
- Do not commit local files such as `.env`, `.DS_Store`, Playwright traces, or reports.
