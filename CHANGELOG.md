{
"$schema": "https://json.schemastore.org/changelog.json",
"version": "0.0.0",
"entries": [
{
"version": "0.0.0",
"date": "2026-07-20",
"sections": {
"Fixed": [
"Background videos (hero + footer) stopped looping after a short while — added missing autoPlay attribute on footer <video>, added 2-second health-check interval in installBackgroundVideoRecovery to restart muted videos paused mid-playback by iOS Safari / Chrome battery saver (loop=true suppresses the ended event per HTML5 spec so existing recovery listeners cannot restart)",
"Prerendered HTML for footer videos now includes the autoplay attribute so it matches React hydration output"
]
}
},
{
"version": "0.0.0",
"date": "2026-06-19",
"sections": {
"Security": [
"REVOKE EXECUTE from PUBLIC on 3 SECURITY DEFINER functions: prevent anonymous execution via REST API",
"Moved pg_net to extensions schema: resolve Supabase security advisor warning",
"Real CSP nonce replacing 'unsafe-inline': per-build nonce shared between headers and index.html",
"HMAC webhook signing replacing plaintext header secret in submit-contact",
"Fail-closed email dispatch in submit-contact (no default onboarding@resend.dev)",
"CodeQL + Dependency Review CI workflows",
"Environment protection (production) on deploy jobs"
],
"Changed": [
"Full Playwright head-only prerendering: 22/22 routes with OG tags, JSON-LD, hreflang in static HTML",
"SettingsContext refactored 250→70 lines, Realtime subscription removed, loaders extracted",
"submit-contact refactored 554→310 lines, email templates extracted to shared modules",
"26 FK indexes added to production database (CONCURRENTLY)",
"exactOptionalPropertyTypes + noFallthroughCasesInSwitch enabled in tsconfig",
"OG image dimensions (width/height/alt) added to all SEO components + 1200x630 PNG default",
"HowTo + Service JSON-LD schemas added",
"robots.txt expanded with 7 new AI bot rules",
"llms.txt expanded (Tech stack, Process, Customer segments, Differentiators)",
".well-known/security.txt (RFC 9116) + llm-policies.json",
"sitemap/robots/RSS generation added to build script with graceful degradation",
"PWA manifest expanded (PNG icons 192/512/maskable, shortcuts, display_override, id)",
"theme-color meta with prefers-color-scheme support (light/dark)"
],
"Removed": [
"opentype.js, @types/dompurify, esbuild, eslint-plugin-import (unused dependencies)",
"4 dead files + 2 empty directories",
"Dead font regex in vite-plugin-csp-nonce.ts (Google Fonts/Playfair replacements)",
"Realtime subscription in SettingsContext (public site overkill)"
]
}
}
]
}
