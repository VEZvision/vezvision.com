# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the VezVision website, please report it privately.

**DO NOT** open a public issue.

**Contact:** security@vezvision.com

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

- CSP with per-build nonce (`script-src 'self' 'nonce-{random}'`) — no `'unsafe-inline'`
- Strict RLS on all public tables, SECURITY DEFINER functions restricted to service_role
- Edge Functions validate all input server-side with rate limiting
- Cookie-consent gating for analytics and Sentry
- No arbitrary CMS script/style injection (CodeInjector allowlist)
- npm audit with moderate+ severity blocking CI
- Dependency review on all PRs
- CodeQL static analysis weekly + on PRs
