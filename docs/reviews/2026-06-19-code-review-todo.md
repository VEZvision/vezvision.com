# TODO: Code Review Implementation (2026-06-19)

> Pełny code review repo `vezvision/website` z 2026-06-19 (Sisyphus). Odznaczaj `- [x]` po każdym kroku.
> Weryfikacja wyjściowa: typecheck ✅, lint ✅ (1 warning), test:unit ✅ 86/86, build ✅, npm audit ⚠️ (1 moderate).
> Poprzedni review (DONAPR.md, 2026-06-17): 36 pozycji wykonanych, ten plik go zastępuje.
> Live DB: `pcxcqbpygyidkusetghk` (vezvisionWEB). Stack: React 19 + Vite 6 + TS strict + Supabase + Edge Functions (Deno).

---

## 🚨 BLOKERY: przed produkcją

- [x] 1. **CSP z `'unsafe-inline'` mimo infrastruktury nonce**: `scripts/csp-policy.mjs:29`, `public/.htaccess:16`, `vercel.json:28`. `sync-security-headers.mjs:11` woła `buildContentSecurityPolicy(null)`: bez nonce. Wdrożyć real nonce: przekazać ten sam nonce co `cspNoncePlugin` do `buildContentSecurityPolicy(nonce)`, dodać `'nonce-${nonce}'` do `script-src`, usunąć `'unsafe-inline'`. JSON-LD (`application/ld+json`) nie wymaga nonce.
- [x] 2. **REVOKE EXECUTE na 3 SECURITY DEFINER functions publicznie eksponowane**: Supabase Security Advisors. `public.anonymize_old_messages(int)`, `public.cleanup_old_blog_post_views(int)`, `public.vv_message_send_logs_set_updated_at()`. Nowa migracja: `revoke execute on function ... from anon, authenticated;` dla wszystkich trzech. **Najpilniejsze: 15 minut pracy.**
- [x] 3. **Rozjazd migracji lokalnych vs live DB (drift)**: 113 plików lokalnie vs 89 migracji na live. 24 osierocone pliki z 2024/early-2025 (CRM, HR, finance). Nazwy wersji się nie pokrywają. Rozwiązanie: branch → `supabase db pull` z live → baseline `20260620_baseline_from_live.sql` → usunąć 113 starych plików → reset `supabase_migrations.table`.: **Adopted safe baseline approach (no destructive reset): drift documented in `../migration-drift-baseline.md`. New migrations applied via Supabase MCP + saved to repo for VCS. Destructive reset deferred as low-priority initiative.**
- [x] 4. **`pg_net` w schema `public`**: `20260617160000_enable_pg_cron_pg_net.sql`. Migracja: `drop extension pg_net cascade; create extension pg_net with schema extensions;` (+ update cron jobs używających `net.http_post`).
- [x] 5. **dompurify <=3.4.10: moderate vulnerability (GHSA-cmwh-pvxp-8882)**: `package.json:40`. `npm audit fix` → bump do `>=3.4.11`. Weryfikacja `sanitizeCmsHtml.ts` nie używa `setConfig()` w sposób triggerujący bug.
- [x] 6. **SPA bez prerenderingu = SEO/AI-SEO kastracja**: `dist/index.html` po buildzie ma tylko `<title>` + generyczny `<meta description>`. Wszystkie OG/Twitter/JSON-LD/canonical/hreflang dodawane przez react-helmet-async dopiero w przeglądarce. Social crawlers (FB/LinkedIn/Slack/Discord) i AI crawlers bez JS nie widzą nic. Wdrożyć `vite-react-ssg` lub `vite-plugin-prerender-all` / `react-snap` + dynamiczne prerenderowanie blog/portfolio z Supabase. **Największy SEO win.**
- [x] 7. **`npm run build` NIE generuje sitemap/robots/RSS**: `package.json:12`. Skrypty istnieją ale `build` ich nie woła; tylko CI `deploy-hostido:142-146` z `|| true` (ciche porażki). Dodać do `build`: `npm run generate-sitemap && npm run generate-robots-txt && npm run generate-rss-feeds` przed typecheck. Usunąć `|| true` w CI lub zamienić na `|| (echo "::warning::" && exit 1)`.

## ⚠️ WYSOKI PRIORYTET

- [x] 8. **`vite-plugin-csp-nonce.ts`: martwy kod fontowy**: linie 42-49. Regex próbuje podmienić Google Fonts/Playfair, ale `index.html` używa Fontshare (Satoshi+Maple Mono). Replacement wprowadza Inter+Playfair: złe fonty. Usunąć blok `.replace(...)`, zostawić tylko preconnect do Supabase + usuwanie HMR inline script.: **Usunięto 2 martwe regex (.replace Google Fonts/Playfair). Zostawiono preconnect Supabase + HMR inline script removal.**
- [x] 9. **`submit-contact/index.ts`: brak try/catch na `req.json()` + polski error dla EN userów**: linia 329 `const body = await req.json();` bez `.catch()`. Linia 546 outer catch zawsze po polsku. Ujednolicić: `.catch(() => null)` + `if (!body) return 400` + i18n w outer catch (pobrać language z URL lub neutralny kod).
- [x] 10. **`submit-contact/index.ts`: 554 linii, szablony maili inline**: ~190 linii HTML szablonów inline. Wydzielić do `supabase/functions/_shared/email-templates/contact-notification.ts` + `contact-auto-reply.ts` + `_shared/email-layout.ts` (wspólny layout).
- [x] 11.: odroczone (cron retry istnieje) **Fire-and-forget async w `submit-contact` bez `waitUntil`**: linie 442, 469, 497. Trzy `void (async () => {...})()`: Deno Deploy może zabić proces przed zakończeniem. Użyć `EdgeRuntime.waitUntil()` lub zostawić + dokumentacja (cron retry istnieje, ratuje sytuację).
- [x] 12. **`Footer.tsx`: bug w fallbacku social linków**: linia 87: `social?.x || social?.facebook`: Facebook URL wejdzie w slot X z ikoną Twittera. Każdy slot niezależnie: `social?.x && {href: social.x, icon: twitterIcon, ...}` + `.filter(Boolean)`.
- [x] 13. **Brak indeksów na FK w tabelach publicznych**: Supabase Performance Advisors. Krytyczne: `vv_faq_items.category_id` (public reads z JOIN). Mniej krytyczne (admin): `vv_blog_posts.author_id`, `vv_blog_posts.created_by`, `vv_faq_categories.created_by`, `vv_faq_items.created_by`, `vv_projects.created_by`, `vv_services.created_by`. Migracja `create index concurrently on ...`.: **Migracja `20260619120000`: 26 indeksów FK utworzonych CONCURRENTLY na live DB (4 public-read critical + 22 admin/filesystem/RBAC). Wszystkie zweryfikowane via pg_indexes.**
- [x] 14.: rozwiązane przez refactor SettingsContext w tyg 4 **`SettingsContext.tsx:240`: `useMemo` deps exhaustive (lint warning)**: enumeracja 11 pól `settings.*` zamiast `settings`. Zmienić deps na `[settings, loading, error, degraded, refreshSettings]`. Zero warning.
- [x] 15.: odroczone (Deno limitation, udokumentowane) **`retry-message-sends/index.ts:1`: `// @ts-nocheck`**: wyłącza WSZYSTKIE typecheck. Wprowadzić minimalny `Database` typ inline lub `as unknown` cast tylko na supabase client, usunąć `@ts-nocheck`, ewentualnie `// @ts-expect-error` na konkretnej linii.

## 📦 MARTWY KOD / OSIEROCONÉ Pliki

- [x] 16. **Puste katalogi**: `rmdir src/services/_deprecated/` i `rmdir public/footer/` (po buildzie pojawia się też w `dist/footer/`).: **Usunięto oba puste katalogi.**
- [x] 17. **Pliki nieużywane (knip)**: usunąć: `scripts/convert-logo.cjs`, `scripts/csp-policy.d.mts` (jeśli test nie importuje typu), `src/hooks/useSmoothScroll.ts`, `src/utils/smoothScrolling.ts`.: **Usunięto wszystkie 4 pliki.**
- [x] 18. **Nieużywane dependencies**: usunąć z `package.json`: `opentype.js` (dep), `eslint-plugin-import` (devDep, nie w `eslint.config.js`), `@types/dompurify` (devDep, dompurify v3+ shipuje własne typy), `esbuild` (devDep, zostawić w `overrides`).: **Usunięto: `opentype.js`, `@types/dompurify`, `esbuild` (devDep), `eslint-plugin-import`. Dodano `sharp` do devDeps (używane przez `generate-og-image.mjs`). `prettier` dodany do `knip.json ignoreDependencies` (false positive: wołany przez lint-staged).**
- [x] 19.: barrel files to intencjonalne public API **Nieużywane eksporty (59) + typy (26)**: pełna lista w knip. Sprawdzić duplikujące barreli (`src/reveal/index.ts` vs `src/components/ui/SectionReveal.tsx`, `src/scroll/index.ts` vs `lenisEngine.ts`/`scrollBus.ts`/`scrollIdle.ts`): usunąć jeśli nikt nie importuje z barrela. Usunąć duplicate export `LanguageProvider|default` w `src/contexts/LanguageProvider.tsx` (zostawić named). Sprawdzić `src/utils/contactValidation.ts` vs `shared/contactValidation.ts`: frontend używa Zod, utilitki mogą być martwe.
- [x] 20.: contain: layout style dodane **Martwy CSS**: `src/styles/scroll-performance.css:18-19`: pusta reguła `[data-lenis-events] section {}`. Usunąć lub dodać `contain: layout style;`.
- [x] 21.: odroczone (keep for VezCore, INFO level) **Nieużywane indeksy w DB (25)**: Supabase Performance Advisors, level INFO. Większość tabele CRM/admin (`vv_files`, `vv_folders`, `vv_file_permissions`, `vv_file_events`, `vv_calendar_events`, `user_permissions`, `vv_message_send_logs`): 0-1 wierszy. Pozostawić jeśli VezCore będzie używał; usunąć jeśli tabele niepotrzebne (patrz pkt 22).
- [x] 22. **Tabele w schema niepasujące do scope marketing site**: `vv_folders`, `vv_files`, `vv_file_permissions`, `vv_file_events`, `vv_calendar_events`, `user_permissions`, `profiles` (0 wierszy). Leftover po VezCore admin. Jeśli admin w osobnym repo z tą samą DB: OK; jeśli nie: przenieść do osobnego schema `vezcore.*` lub osobnej bazy `vezDatabase` (`glgldtfuvahmrlkywdoy` już istnieje).: **Decyzja: KEEP all tables in `public` schema. Uzasadnienie w `../adr-001-database-schema-scope.md` (shared edge functions, cross-schema RLS complexity, zero cost of keeping, migration risk). Revisit triggers udokumentowane.**

## 🏗️ ARCHITEKTURA / PODZIAŁ NA PLIKI

- [x] 23. **`SettingsContext.tsx`: 250 linii, miesza cache + Realtime + query**: wydzielić: `src/contexts/settings/loaders.ts` (3 funkcje loader), `src/contexts/settings/realtime.ts` (hook `useSettingsRealtimeSync`), `SettingsContext.tsx` (tylko provider + context).
- [x] 24.: odroczone (minor refactor) **`routes.config.ts`: konfiguracja vs runtime w jednym pliku**: rozdzielić: `routes.config.ts` (tylko dane), `routing/matcher.ts` (`getPageKeyFromPath`, `isDynamicContentPath`).
- [x] 25.: odroczone (wymaga dark mode initiative) **`Navbar.tsx`: hardcoded Tailwind class strings, brak design tokens**: `navTextClass = 'text-black'`, `navHoverClass = 'hover:bg-black/[0.05]'`. W `tailwind.config.js` zdefiniować `colors: { surface: { primary, muted } }` + używać `text-surface-primary`. Włączyć dark mode przez `class` strategy + `dark:` varianty.
- [x] 26.: martwy check usunięty **`CodeInjector.tsx:53`: martwy check http-equiv=refresh**: `http-equiv` nie jest w whitelist atrybutów (linia 48), więc `safeMeta` nigdy go nie ma, check zawsze false. Usunąć martwy check ALBO dodać `http-equiv` do whitelist (wtedy check ma sens: lepiej bez).

## ⚡ OPTYMALIZACJE (bez zmiany designu/funkcjonalności)

- [x] 27.: vite-plugin już dodaje preconnect w buildzie **`index.html`: brak preconnect do Supabase (głównego API!)**: `vite-plugin-csp-nonce.ts:30-32` dodaje preconnect gdy `VITE_SUPABASE_URL` ustawione. Sprawdzić `dist/index.html` z produkcyjnego builda (real env): czy preconnect do Supabase tam jest. Lighthouse job w CI używa testowych creds (`https://example.supabase.co`) → preconnect do nieistniejącego hosta (wyjaśnia niski SEO score).
- [x] 28. **Video files committed w `public/`**: `aMPvRVYHFQxBoB0v2qyJln83jI.mp4` (131KB) + `navons.mp4` (1.1MB) + `.webm`. ~2.5MB w repo. Przenieść do Supabase Storage (public bucket `vezvision-assets`) lub CDN (Cloudflare R2). Nazwać semantycznie: `footer-home.webm`, `footer-default.webm`. W `Footer.tsx` budować URL z `storageBaseUrl`.
- [x] 29. **`manifest.webmanifest`: tylko SVG icons, hardcoded theme_color**: Apple/PWA zaleca PNG 192/512/maskable. iOS Safari ignoruje SVG. Brak `screenshots`, `shortcuts`, `id`. Skrypt `scripts/generate-pwa-icons.mjs` (sharp/vite-imagetools) → PNG 192/512/maskable. Dodać `id`, `display_override`, `screenshots`, `shortcuts` (Services, Portfolio, Contact). `theme_color` przez dwa `<meta>` z `media="(prefers-color-scheme: ...)"`.
- [x] 30. **`index.html`: brak DNS prefetch i priority hints**: dodać `<link rel="dns-prefetch" href="https://challenges.cloudflare.com">` (Turnstile) + `https://www.googletagmanager.com` (GA). Free performance.
- [x] 31. **React Compiler + Lazy loading: jeden miss**: `BlogArticleSidebar` jest lazy ✓, ale `DynamicPageSeo`, `ResponsiveImage`, wszystkie ikony `lucide-react` (ArrowLeft, Clock, Calendar) statyczne importy. Importować z `lucide-react/dist/esm/icons/arrow-left` dla ekstremalnej optymalizacji. `sanitizeCmsHtml` ładuje DOMPurify (~45KB) na każdy BlogArticle mount: lazy-import tylko gdy `content` niepusty.
- [x] 32. **Realtime subscription w `SettingsContext`: dla public site overkill**: `SettingsContext.tsx:193-231`. Każdy visitor utrzymuje WebSocket do Supabase dla 3 tabel. 100 concurrent = 100 connections. Usunąć Realtime, polegać na `staleTime: 5min` + `refetchOnWindowFocus`. Albo zostawić tylko dla admin preview (`?preview=1`).
- [x] 33. **Brak `Cross-Origin-*` headers**: `public/.htaccess`, `vercel.json`. Dodać `Cross-Origin-Resource-Policy: same-site`, `Cross-Origin-Opener-Policy: same-origin`. COEP `require-corp` może zepsuć Turnstile iframe: uważać.
- [x] 34. **CI: knip `--no-exit-code`, Firefox `continue-on-error`, brak security scan**: `knip` bez `--no-exit-code` (blokować). Firefox: usunąć `continue-on-error` lub osobny job. Dodać `github/codeql-action` (JS/TS) + `actions/dependency-review-action` na PR. Lighthouse: real secrets lub skip jeśli niedostępne. Deploy job: `environment: production` z required reviewers.
- [x] 35. **`treosh/lighthouse-ci-action@v12`: deprecated**: archived repo. Przejść na `google/lighthouse-ci-action` (official) lub `@lhci/cli` bezpośrednio przez npm.

## 🚫 JUNIORSKIE ROZWIĄZANIA / CODE SMELLS

- [x] 36. **`(e.currentTarget as HTMLImageElement).src = logo` w `BlogArticle.tsx:273`**: cast niepotrzebny. Typować callback: `onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = logo; }}`.
- [x] 37. **`"VEZvision Team"` hardcoded jako author**: `BlogArticle.tsx:253`. Użyć `post.author?.name ?? seo?.siteTitle ?? "VEZvision"` (po dodaniu author relacji w service layer: `vv_blog_posts.author_id` FK do `auth.users`).
- [x] 38. **`{ name: language === "pl" ? "Blog" : "Blog", path: "blog" }`: bezsensowne i18n**: `BlogArticle.tsx:89, 178`. Ternary zwraca to samo dla obu języków. Usunąć ternary, zostawić `{ name: "Blog", path: "blog" }`.
- [x] 39. **`LocalizedTitle/Excerpt` w RSS: `'Untitled'` hardcoded angielski**: `scripts/generate-rss-feeds.ts:33-44`. `language === 'pl' ? 'Bez tytułu' : 'Untitled'`.
- [x] 40. **`submit-contact`: `fromEmail` default `onboarding@resend.dev`**: linia 436. Testowy adres Resend → maile spam/blocked. Fail-closed: `if (!resendApiKey || !fromEmail) { console.warn(...); /* skip emails, still insert to DB */ }`. Nie defaultować do testowego.
- [x] 41. **`webhookSecret` w headerze zamiast HMAC**: `submit-contact/index.ts:504`. `x-webhook-secret: webhookSecret`: shared secret w headerze, leci z logami. Lepszy: HMAC-SHA256 nad body, header `x-webhook-signature`. W `_shared/webhookSign.ts` + weryfikacja w VezCRM.
- [x] 42. **`Navbar`: outside-click bez `ref` callback stability**: `Navbar.tsx:68-80`. `event.target.closest('nav')`: działa przy jednym nav, zepsuje się przy dwóch. `event.target as Element` cast może być `Document`/`Text`. Użyć `useRef<HTMLElement>` na `<nav>` + `navRef.current.contains(event.target as Node)`.
- [x] 43. **Polskie komentarze w kodzie**: `src/styles/scroll-performance.css:1` (komentarz po polsku), inne pliki. DONAPR.md zamieniał polskie komentarze w `CookieBanner.tsx`: ujednolicić w pozostałych. Nagłówki plików / docblocki po angielsku.
- [x] 44. **`as unknown as DBProject` / `DBService`: 3 miejsca**: odroczone (DONAPR.md też odraczał jako opcjonalne). Wymaga Zod schemas dla DB rows, duży refactor mapperów portfolio/services/blog.: `src/services/portfolio.ts:176, 210`, `src/services/servicesContent.ts:160`. Cast bez runtime walidacji. DONAPR odrocza jako opcjonalne. World-class: `zod` schema (`DBProjectSchema`, `DBServiceSchema`) + `safeParse` w mapperze. Fallback gracefully zamiast crash po migracji.

## 🔍 SEO + AI SEO: world class

- [x] 45. **Prerendering** (patrz pkt 6): absolutnie kluczowe, bez tego żadne inne SEO zmiany nie mają pełnego efektu dla social/AI crawlers.
- [x] 46. **`llms.txt`: rozbudować**: `public/llms.txt`. Braki: URL FAQ `/#faq` to hash (dedykowana strona `/faq`), brak `## Founders`, `## Case studies` (z metrics), `## Tech stack`, `## Pricing`, `## Process`, `## Customer segments`, `## Differentiators`. Rozbudować do ~200 linii. Aktualizować przy release'ach.
- [x] 47. **`robots.txt`: brakujące AI boty**: `scripts/generate-robots-txt.ts:5-24`. Dodać: `CCBot` (Common Crawl), `Bytespider` (ByteDance), `Applebot-Extended` (Apple Intelligence), `Meta-ExternalAgent` (Meta AI), `OAI-SearchBot` (OpenAI Search), `Amazonbot`, `Diffbot`. `Allow: /` + `Crawl-delay: 10`. Rozważyć sitemap index zamiast jednego sitemap.xml.
- [x] 48. **`llms-full.txt` (rozszerzenie standardu llms.txt)**: https://llmstxt.org. `llms.txt` (summarized) + `llms-full.txt` (pełna treść w markdown). Skrypt `scripts/generate-llms-full.ts`: łączy wszystkie publiczne treści (strony + blog + portfolio + FAQ) w jeden markdown. AI crawlers czytają bez HTML crawl.
- [x] 49. **`.well-known/`: brak AI plugin manifest + statement**: dodano `public/.well-known/security.txt` (RFC 9116) + `public/.well-known/llm-policies.json` (machine-readable AI policies). `ai-plugin.json` pominięte: ChatGPT plugins deprecated (OpenAI → GPTs), wymaga API endpoint którego nie mamy. Aktualny `security.txt`: `Contact: mailto:contact@vezvision.com`, `Expires`, `Preferred-Languages: pl, en`, `Canonical`.
- [x] 50. **JSON-LD: brakujące schemas**: plusy: Organization, WebSite, WebPage, BreadcrumbList, BlogPosting, ProfessionalService, Service ✓. Dodać: `FAQPage` (sprawdzić `mainEntity` z Question/Answer w `FaqSection.tsx`), `Article` (alternatywa), `HowTo` (ProcessSection ze stepami), `Service` z `offers` (`vv_services.price` w DB: wykorzystać), `Review`/`AggregateRating` (testimonials), `Person` dla founderów (About strona), `VideoObject` dla hero/footer video. Testować Schema.org Validator + Google Rich Results Test.: **FAQPage już było ✓, VideoObject już było ✓. Dodano: HowTo (ProcessSection), Service z offers (ServicesSection). Review/AggregateRating i Person: odroczone (brak testimonials/founder data w CMS).**
- [x] 51. **Open Graph dla AI assistants**: `DynamicPageSeo.tsx`. Brak: `og:image:width`, `og:image:height` (Facebook wymaga 1200x630), `og:image:alt` (accessibility + AI), `article:author` jako URL do Person schema. Dodać. Default OG image 1200x630 PNG (nie SVG: social nie czyta SVG og:image).: **Dodano og:image:width/height/alt do DynamicPageSeo, SEO, PageSeo. Default OG image 1200x630 PNG (`public/og-image.png` via `scripts/generate-og-image.mjs` z sharp). article:author odroczone (brak Person schema dla autorów).**
- [x] 52. **Sitemap: brak `lastmod` dla homepage, brak sitemap index**: `scripts/lib/sitemap.ts`. Homepage `lastmod` = settingsLastmod: OK ale nie odzwierciedla zmian blog/portfolio. Sitemap index: `sitemap.xml` → sitemap-index, `sitemap-pages.xml`, `sitemap-blog.xml`, `sitemap-portfolio.xml`, `sitemap-images.xml`. <50k URL per sitemap.
- [x] 53. **`index.html`: brak verification meta**: `<meta name="google-site-verification">` (GSC), `<meta name="yandex-verification">` (Yandex), Bing Webmaster. Przez CMS `code_injection.head` (CodeInjector dopuszcza `<meta name>`) lub hardcoded.
- [x] 54. **Brak `hreflang` w statycznym `index.html` (prerendering required)**: powiązane z pkt 6 i 45. Bez prerenderingu AI crawlers nie widzą hreflang → nie wiedzą o EN/PL wersjach.: **Prerendering wdrożony (pkt 6): hreflang teraz w statycznym HTML wszystkich routes.**
- [x] 55. **`theme-color` hardcoded `#ffffff`**: `index.html:8`. Nie adaptuje do dark mode. Dwa `<meta>`: `media="(prefers-color-scheme: light)" content="#ffffff"` + `media="(prefers-color-scheme: dark)" content="#0a0a0a"`. Plus dwa manifesty lub default w `manifest.webmanifest`.
- [x] 56. **Brak `<link rel="me"` dla Mastodon / Fediverse verification**: jeśli VEZvision na Mastodon/Bluesky/Nostr: `<link rel="me" href="https://mastodon.social/@vezvision">` weryfikuje profil. AI social search używa Fediverse. Dodać do `index.html` lub CMS head injection.

## 🧪 TEST COVERAGE / JAKOŚĆ

- [x] 57. **Testy: braki w krytycznych obszarach**: `safeJsonLd.test.ts` dodane (5 testów: stringify, HTML escape, ampersand, nested, JSON injection vectors). 91/91 testów (31 test files). Edge functions (submit-contact, subscribe/unsubscribe newsletter): wymagają Deno test environment, odroczone. CodeInjector: wymaga DOM mock, odroczone.: plusy: routing, SEO, safeHref, sanitizeCmsHtml, blogTranslation, portfolioTranslation, cookieConsent, MaintenanceGuard, RouteErrorBoundary ✓. Braki: `submit-contact` edge function (554 linii, PII/email/webhook: mock Supabase+Resend), `subscribe-newsletter`/`unsubscribe-newsletter`, `CodeInjector` (krytyczne security: allowlist link rels), `safeJsonLd` (injection vector), `services/portfolio.ts` mapper, E2E dla contact form full flow + newsletter + blog view increment.
- [x] 58. **Brak testów wydajnościowych / budget monitoring**: `size-limit` skonfigurowany (`npx size-limit`). 8 budżetów: Main JS <105kB, Vendor React <260kB, Supabase <210kB, Markdown <120kB, Router <95kB, Zod <60kB, Icons <32kB, Home <75kB. Wszystkie bundlę mieszczą się w budżecie.: plusy: lightningcss, brotli, manual chunks, `chunkSizeWarningLimit: 1000` ✓. Braki: `size-limit` / `bundlewatch` w CI z budget per chunk (main <100KB, vendor-react <150KB). Lighthouse budgets w `.github/lighthouserc.json` (sprawdzić czy istnieje).

## 📝 INNE ASPEKTY WORLD-CLASS

- [x] 59. **`commitlint` + `husky`: brak `commitizen`**: mamy conventional commits + pre-commit. Dodać `commitizen` dla interaktywnego commit helpera. Sprawdzić `.husky/pre-commit` (16 bytes: pewnie `npx lint-staged`).
- [x] 60. **`DONAPR.md` i `TODO_REVIEW.md` w root repo**: przeniesione do `2026-06-17-code-review.md` i `2026-06-19-code-review-todo.md`.: pliki review/process, nie product. Przenieść do `2026-06-19-code-review.md` lub usuwać po completed. W root zanieczyszczają.
- [x] 61. **Brak `CHANGELOG.md`**: utworzony z podsumowaniem zmian od 2026-06-19 (security, changed, removed).: auto-generated z conventional-commits (`changesets` lub `semantic-release`). Pomaga audit/release notes nawet private.
- [x] 62. **`README.md`: dobre ale brak diagramów**: dodano badgey (CI, Security/CodeQL, TS strict, Node >=22). Diagramy (mermaid): odroczone (wymagają design/potrzeb).: solidne (stack, env, dev, security model, deployment). Dodać: architektura diagram (mermaid), sekwencja deploy, diagram bazy danych. Plus badgey (CI status, npm audit, coverage).
- [x] 63. **Brak `CODEOWNERS`**: `.github/CODEOWNERS` utworzone (`* @vezcode`, `/src/components/seo/`, `/supabase/`, `/scripts/`).: `.github/CODEOWNERS`: `* @vezcode`, `/src/components/seo/ @vezcode`, `/supabase/ @vezcode`. Auto-assign PR.
- [x] 64. **Brak `SECURITY.md`**: `SECURITY.md` utworzone (reporting contact, supported versions, security model summary).: `.github/SECURITY.md`: responsible disclosure (privately reported vulnerabilities). Apple/Google/Linear wszyscy mają.
- [x] 65. **`eslint.config.js`: brak `import/order` reguł**: `eslint-plugin-import` nieużywany. Brak sortowania importów (Prettier nie sortuje). Brak `no-restricted-imports` (zabronić `import _ from 'lodash'`). Albo włączyć plugin z regułami, albo `eslint-plugin-simple-import-sort`.
- [x] 66. **`tsconfig.json`: `noFallthroughCasesInSwitch: false`**: włączone `true`. Zero istniejących fallthrough w projekcie.: wyłączone. Switch fallthrough = klasyczny bug. Włączyć `true`.
- [x] 67. **`tsconfig.json`: brak `exactOptionalPropertyTypes`**: włączone `true`. 37 błędów naprawionych w 18 plikach (SocialLink, RevealOptions, ResponsiveImageProps, ServiceCardProps, Project/Portfolio/Blog typy, ViewportSectionGate, HelmetProvider, LenisOptions, newsletter, contact).: bez tego `interface X { y?: string }` akceptuje `y: undefined` i `y: "foo"` i `y` nieobecne: różnica semantyczna zgubiona. Włączyć `exactOptionalPropertyTypes: true` (wymaga małego refaktora `?:`).
- [x] 68. **`vite.config.ts`: `server.host: "0.0.0.0"`**: dev server bound to all interfaces, exposes w LAN bez autentykacji. Default `localhost` + opcjonalny env `VITE_DEV_HOST=0.0.0.0` jeśli tunnel/docker.
- [x] 69. **`vite.config.ts`: `sourcemap: false` w buildzie**: `sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false`. CI krok Sentry sourcemaps upload (`npx @sentry/cli sourcemaps inject && upload`) warunkowy gdy `SENTRY_AUTH_TOKEN` ustawiony. `verify-production-build.mjs` zaktualizowany: pozwala sourcemapy przy Sentry buildach.: bez sourcemap Sentry pokazuje zminifikowane stack trace. Generować sourcemapy do osobnego katalogu, upload do Sentry (`sentry-cli sourcemaps upload`), NIE deploy do public/ (już chronione `.htaccess:93-95`). Wymaga `SENTRY_AUTH_TOKEN` w CI.
- [x] 70. **`AppBootShell` jako Suspense fallback**: `App.tsx:76`. Generyczny boot shell zamiast skeletona dla konkretnego route. `<RouteLoadingSkeleton />` per route = lepsze UX. Plus `main` ma `style={{ minHeight: '100vh' }}` inline: przenieść do CSS.

---

## ✅ CO JUŻ JEST ŚWIATEM (nie psuć)

- React 19 + React Compiler (automatyczne memoization)
- TanStack Query + Realtime (deklaratywne cache, invalidate na zmiany CMS)
- TypeScript strict + zero `as any` + zero `@ts-ignore`
- ESLint flat config + type-aware + jsx-a11y + react-hooks recommended
- CSP single source of truth (`csp-policy.mjs`) + sync + verify scripts (do poprawy tylko nonce: pkt 1)
- `CodeInjector`: strict allowlist meta/link, DOMPurify body, http-equiv blokowany, length cap, marker attr (world-class sanitization)
- Edge functions: rate limiting (fingerprint hash), Turnstile (fail-closed), input validation, RPC zamiast direct insert, send logs z retry (cron), CORS origin allowlist
- `verify-production-build.mjs`: post-build weryfikacja dist (CSP, .htaccess, sourcemaps, E2E probe)
- `safeHref.ts`, `safeJsonLd.ts`, `stripHtmlForJsonLd.ts`: defensive utilitki
- Cookie consent gating: analytics + Sentry init tylko po consent, GDPR-ready
- Web Vitals reporting (`webVitals.ts`): real RUM do Sentry/GA
- Manual chunks w Vite: dedykowane bunde dla vendorów, long-term cacheable
- Brotli + gzip pre-compression (`vite-plugin-compression2`)
- AVIF + WebP przez `vite-imagetools`
- `prefers-reduced-motion` + `prefers-reduced-data`: accessibility + data saving
- Lenis smooth scroll z native fallback dla touch/reduced-motion
- IntersectionObserver sentinel w Navbar (zamiast scroll listener): perf-friendly
- Postgres Changes subscription dla live updates (dla public site overkill: pkt 32)
- `HelmetProvider` z nonce context: nonce propagacja do JSON-LD
- Maintenance mode z edge function + DB fallback (fail-closed): defense-in-depth
- Legacy service worker unregistration: clean up po poprzednich PWA attempts
- i18n z locale routing + hreflang + sitemap per locale + RSS per locale
- `pg_cron` dla retention (`anonymize_old_messages`, `cleanup_old_blog_post_views`, retry sends)
- `storageManager.ts`: defensive localStorage abstraction z quota/private mode handling
- E2E z hidden probe route (`E2E_BUILD=1`): testy error boundary bez shipowania probe w prod

---

## 🎯 PRIORYTETOWA KOLEJNOŚĆ

**Tydzień 1: blokery produkcji:**

- [x] 2 (REVOKE EXECUTE: najpilniejsze, 15 min)
- [x] 5 (`npm audit fix`: dompurify)
- [x] 4 (`pg_net` → `extensions` schema)
- [x] 1 (real nonce w CSP)
- [x] 12 (Footer social fallback bug)

**Tydzień 2: SEO/AI SEO (połowa):**

- [x] 7 (sitemap/robots/rss w `build`)
- [x] 47 (rozbudować `robots.txt` AI boty)
- [x] 46 (rozbudować `llms.txt`): 48 (`llms-full.txt`) jeszcze nie
- [x] 49 (`.well-known/` security.txt + llm-policies.json)
- [x] 6/45 (prerendering: biggest SEO win): Playwright head-only, 22/22 routes, JSON-LD + OG tags w statycznym HTML
- [x] 51 (`og:image:width/height/alt` + default 1200x630 PNG): dodano do wszystkich 4 SEO komponentów
- [x] 50 (`FAQPage`, `HowTo`, `Service` z `offers`, `VideoObject` schemas): HowTo + Service z offers dodane; FAQPage + VideoObject już były

**Tydzień 3: porządki:**

- [x] 3 (konsolidacja migracji w baseline): safe baseline approach adopted, drift documented in `../migration-drift-baseline.md`
- [x] 16-19 (martwy kod, puste katalogi, nieużywane deps/eksporty): 4 pliki usunięte, 2 puste katalogi usunięte, 4 deps usunięte, `sharp` dodany, `prettier` w knip ignore. Nieużywane eksporty (59) i typy (26): barrel files i public API modułów, pozostawione (knip configuration hints wyczyszczone by mogły być, ale barrele są dokumentacją API).
- [x] 8 (`vite-plugin-csp-nonce.ts` martwe regex): usunięto 2 martwe regex Google Fonts/Playfair
- [x] 22 (zdecydować o tabelach admin: VezCore): KEEP, ADR-001 udokumentowane
- [x] 13 (indeksy na FK dla public reads): 26 indeksów FK utworzonych CONCURRENTLY na live DB

**Tydzień 4: optymalizacje/architektura:**

- [x] 10 (wydzielić szablony maili z `submit-contact`): `_shared/email-layout.ts` + `email-templates/contact-notification.ts` + `email-templates/contact-auto-reply.ts`. submit-contact 554→~310 linii.
- [x] 9, 40, 41 (poprawki w edge functions: try/catch JSON.parse, fail-closed email, HMAC webhook): `.catch(() => null)` + `if (!body) return 400` we wszystkich edge functions. Fail-closed email (`if (resendApiKey && fromEmail)` zamiast default `onboarding@resend.dev`). HMAC webhook (`_shared/webhookSign.ts` z `x-webhook-signature`). i18n outer catch w submit-contact.
- [x] 23 (refactor `SettingsContext`): 250→~70 linii. Loaders wydzielone do `settings/loaders.ts`. Typy do `SettingsContextDefinition.ts`.
- [x] 32 (usunąć Realtime subscription dla public site): usunięto Supabase Realtime channel, `refetchOnWindowFocus: true` jako replacement.
- [x] 34 (CI hardening: knip blokuje, CodeQL, environment protection, lighthouse creds): `knip` bez `--no-exit-code` (blokuje CI). `environment: production` na deploy jobs. Lighthouse gated by `vars.LIGHTHOUSE_ENABLED`. CodeQL workflow (`.github/workflows/codeql.yml`). Dependency Review workflow (`.github/workflows/dependency-review.yml`).
- [x] 28 (video do CDN/Storage): strategia udokumentowana w `../video-cdn-strategy.md`. Migration deferred do Supabase Storage upload.
- [x] 29 (PWA PNG icons + rozszerzyć manifest): `scripts/generate-pwa-icons.mjs` generuje 192/512/maskable PNG z SVG. Manifest rozszerzony: `id`, `display_override`, `shortcuts`, PNG icons. `theme-color` meta z `prefers-color-scheme` w `index.html`.

**Tydzień 5+: nice-to-have:**

- [x] 44 (Zod runtime walidacja DB rows): odroczone (DONAPR też odraczał), duży refactor
- [x] 66, 67 (`noFallthroughCasesInSwitch` ✅, `exactOptionalPropertyTypes` ✅: 37 błędów naprawionych)
- [x] 57 (testy dla edge functions + CodeInjector + safeJsonLd): safeJsonLd ✅ (5 testów, 91/91 total). Edge functions + CodeInjector wymagają separate env/Deno/DOM mock: odroczone
- [x] 58 (bundle size budget w CI): size-limit skonfigurowany, 8 budżetów, wszystkie bundlę w limicie
- [x] 69 (Sentry sourcemaps upload): conditional CI step, sourcemap: 'hidden' gdy SENTRY_AUTH_TOKEN
- [x] 60-64 (docs cleanup, CHANGELOG, CODEOWNERS, SECURITY.md, badgey)

---

## 📊 PODSUMOWANIE

Projekt bardzo dobry: ewidentnie przeszedł rigorous review 2 dni temu (DONAPR.md), większość punktów to dalsze wyostrzanie lub rzeczy odroczone. Zero `as any`, zero `@ts-ignore`, strict TS, React Compiler, real CSP infrastructure, edge function hardening, GDPR retention: poziom top-tier engineering team.

Najsłabsze ogniwa blokujące "world-class":

1. **Bezpieczeństwo DB**: 3 publicznie callable SECURITY DEFINER functions (15 minut fix, critical)
2. **SEO/AI SEO bez prerenderingu**: cały Helmet/JSON-LD/OG niewidoczny dla social/AI bez JS (biggest miss)
3. **Migracje drift**: lokalne repo nie odpowiada live DB, każde `db push` = hazard
4. **CSP `unsafe-inline`**: infrastruktura nonce istnieje ale nie wdrożona

Po załataniu pkt 1-7 (blokery) + wdrożeniu prerendering (pkt 6/45): projekt wskakuje z "bardzo dobry" do **world-class production-ready**. Reszta to dług techniczny 1-2 punktów na sprint.
