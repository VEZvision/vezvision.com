# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the VEZvision website, please report it privately.

**DO NOT** open a public issue.

**Contact:** contact@vezvision.com

Please include:

- A description of the vulnerability
- Steps to reproduce
- Affected versions/components
- Any potential impact

We aim to acknowledge reports within 48 hours and provide a resolution timeline within 5 business days.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Security Model

See `README.md` for the full security model description. Key points:

- CSP strict — `script-src 'self'` (no `'unsafe-inline'` for scripts), `object-src 'none'`, `frame-ancestors 'none'`. No inline scripts in production build. `style-src 'unsafe-inline'` is required for Tailwind-generated styles.
- Public PostgREST uses a dedicated read-only database role and a GET-only gateway
- The Node API uses a separate least-privilege role, parameterized SQL, input limits, Turnstile and persistent rate limiting
- Cookie-consent gating for analytics and Sentry
- No arbitrary CMS script/style injection (CodeInjector allowlist)
- npm audit with moderate+ severity blocking CI
- Dependency review on all PRs
- CodeQL static analysis weekly + on PRs
