# Code Review: 2026-06-21 (Drugi przegląd)

> Pełny code review repo `vezvision/website`: drugi niezależny przegląd.
> Live DB: `pcxcqbpygyidkusetghk` (vezvisionWEB, eu-west-2, ACTIVE_HEALTHY, PG 17.6.1).
> Stack: React 19.2 + Vite 6.4 + TS strict (`exactOptionalPropertyTypes`, `noUncheckedSideEffectImports`) + Tailwind 3.4 + Supabase (Postgres 17, Edge Functions Deno) + React Compiler + Lenis smooth scroll + react-helmet-async v3.

---

## Weryfikacja automatyczna (stan obecny)

| Check                         | Wynik                                                |
| ----------------------------- | ---------------------------------------------------- |
| Typecheck (`tsc -b --noEmit`) | 0 errors ✅                                          |
| Lint (`eslint src/`)          | 0 errors, 1 pre-existing warning ✅                  |
| Unit tests (`vitest --run`)   | 91/91 pass (31 files) ✅                             |
| Supabase security advisors    | 0 lints ✅                                           |
| Supabase performance advisors | 0 duplicate_index WARN, 40 unused_index INFO ✅      |
| Type safety                   | zero `as any`, `@ts-ignore`, `@ts-nocheck` w src/ ✅ |
| `as unknown as`               | 4 uzasadnione (Supabase joins, window.gtag) ✅       |
| CSP test                      | 3/3 pass ✅                                          |
| Security headers verify       | ✅                                                   |
| Edge-shared parity            | ✅                                                   |

---

## 🔴 Do zrobienia: lepsze rozwiązania, rozdzielenie plików, optymalizacje

### 1. `vite-plugin-compression2`: dodaj gzip fallback

**Plik:** `vite.config.ts:97-101`

Obecnie generowany jest tylko Brotli (`.br`). Hostido/nginx automatycznie serwuje `.br` gdy `Accept-Encoding: br`, ale **niektóre starsze przeglądarki i narzędzia** (np. niektóre crawlery, curl bez `--compressed`) nie wysyłają `Accept-Encoding: br`. Brak gzip fallback = pełny nieskompresowany transfer.

**Naprawa:**

```ts
compression({
  algorithms: ['gzip', 'brotliCompress'],
  threshold: 1024,
}),
```

`.htaccess` już obsługuje oba (`.br` i `.gz`: linie 2-10). Wystarczy włączyć generowanie obu.

### 2. `llms-full.txt`: brakujący plik companion

**Status:** `public/llms.txt` istnieje (index/lobby), ale brak `public/llms-full.txt` (library/full content).

llms.txt spec (Jeremy Howard, llmstxt.org) definiuje dwa pliki:

- `llms.txt`: krótki index (~100-200 linii), projekt ma ✅
- `llms-full.txt`: pełna treść najważniejszych stron w jednym pliku Markdown, do 1-10K linii, projekt **nie ma** ❌

AI crawlers (GPTBot, ClaudeBot, PerplexityBot) mogą wziąć całą treść jednym fetchem zamiast N zapytań.

**Naprawa:** Utwórz `scripts/generate-llms-full.ts` który generuje `public/llms-full.txt` z treści (services, portfolio, FAQ, kluczowe blog posts) podczas builda. Dodaj do `npm run build`.

### 3. DOMPurify v3.4.2 → v3.4.9

**Plik:** `package.json:46`

Zainstalowana wersja `^3.4.2`, najnowsza to `3.4.9` (published 2026-06-10). Zmiany: improved Trusted Types handling, improved `IN_PLACE` sanitization, bumped deps. Bezpieczne, wstecznie kompatybilne.

**Naprawa:** `npm install dompurify@3.4.9`

### 4. `SEO.tsx`: 15 powtórzeń `!hasDedicatedPageSeo && !shouldSuppressFallbackSeo`

**Plik:** `src/components/seo/SEO.tsx` (144 linie)

Ten sam warunek `!hasDedicatedPageSeo && !shouldSuppressFallbackSeo` powtórzony 15 razy w JSX. Bardzo trudne do czytania i utrzymania.

**Naprawa:** Wyciągnij helper:

```ts
const showFallback = !hasDedicatedPageSeo && !shouldSuppressFallbackSeo;
```

I w JSX:

```tsx
{
  showFallback && seo?.siteTitle ? <title>{seo.siteTitle}</title> : null;
}
{
  showFallback && siteDescription ? (
    <meta name="description" content={siteDescription} />
  ) : null;
}
```

Redukcja z 15 powtórzeń do 1 zmiennej.

### 5. `src/services/settings.ts`: 380 linii, 12 normalize funkcji w jednym pliku

**Plik:** `src/services/settings.ts` (380 linii)

Plik zawiera: 9 interfejsów, `EMPTY_PUBLIC_SETTINGS` (62 linie), 12 funkcji normalize (`normalizeIdentity`, `normalizeContact`, `normalizeSocial`, `normalizeSeo`, `normalizeMaintenance`, `normalizeSeoFiles`, `normalizeCompany`, `normalizeNavigation`, `normalizeFooter`, `normalizeLocalizedLinkItems`, `normalizeAddress`, `normalizeSettingsEntries`), oraz funkcję `getSettings`.

**Naprawa:** Rozdziel na:

```
src/services/settings/
  types.ts          (interfejsy: ContactSettings, SocialSettings, ...)
  defaults.ts       (EMPTY_PUBLIC_SETTINGS)
  normalizers.ts    (wszystkie normalize* funkcje)
  index.ts          (getSettings, normalizeSettingsEntries, re-exports)
```

### 6. Edge function response helper: 428 linii z 15+ powtórzeń JSON.stringify Response

**Plik:** `supabase/functions/submit-contact/index.ts` (428 linii)

Każdy error/0200 response buduje `new Response(JSON.stringify({...}), { headers: {...getCorsHeaders(req), "Content-Type": "application/json"}, ... })`: powtórzony 15+ razy w różnych wariantach.

**Naprawa:** Wyciągnij do `_shared/response.ts`:

```ts
export function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    status,
  });
}
export function errorResponse(
  req: Request,
  error: string,
  status: number,
  field?: string,
): Response {
  return jsonResponse(
    req,
    { success: false, error, ...(field ? { field } : {}) },
    status,
  );
}
```

### 7. `"strict CSP with per-build nonce"`: staly wpis w `llms.txt`

**Plik:** `public/llms.txt:52`

Linia: `- Standards: strict CSP with per-build nonce, GDPR-compliant cookie consent, ...`

CSP nie ma już nonce (usunięto w Sprint 2: `script-src 'self'` bez nonce). Należy zaktualizować opis na `strict CSP (script-src 'self', object-src 'none', frame-ancestors 'none')`.

### 8. `SettingsContext.tsx:65`: eslint warning `react-hooks/exhaustive-deps`

**Pre-existing warning:** `React Hook useEffect has a missing dependency: 'query'`

useEffect używa `query.data` w deps ale ESLint widzi `query` jako potrzebne. To pre-existing: poprzedni review (2026-06-19, punkt 14) oznaczył to jako resolved przez refactor, ale warning wciąż występuje.

**Naprawa:** Zmień deps na `[query.data]` → nadal warning. Lepiej użyć `query` w deps i destrukturyzować w ciele:

```ts
}, [query])  // ESLint nie będzie warnować
```

Albo użyć `useMemo` dla `settingsToCache` poza useEffect.

### 9. `robots.txt`: brak 3 nowych AI botów w public/robots.txt

**Plik:** `public/robots.txt` (commitowany, statyczny)

Skrypt `scripts/generate-robots-txt.ts` już dodaje `GoogleGenAI`, `Meta-ExternalFetcher`, `AI2Bot`: ale `public/robots.txt` w repo jest stary (z nowymi botami dopiero po `npm run generate-robots-txt`). Plik jest w `.gitignore` (generowany), ale w repo leży stara wersja.

**Naprawa:** Uruchom `npm run generate-robots-txt` i zcommituj zaktualizowany plik (albo usuń z repo skoro jest w `.gitignore`: prawidłowe podejście to generowanie przy buildzie).

### 10. `SettingsContext.tsx`: `Object.fromEntries + Object.entries` filter `error/degraded`

**Plik:** `src/contexts/SettingsContext.tsx:55-65`

```ts
const settingsToCache = Object.fromEntries(
  Object.entries(query.data).filter(
    ([key]) => key !== "error" && key !== "degraded",
  ),
) as Omit<typeof query.data, "error" | "degraded">;
```

Tworzy nowy obiekt przez `Object.fromEntries` na każdej zmianie settings: tworzy garbage przy każdym refetch (co 5min + na focus). Zamiast tego:

```ts
const { error: _e, degraded: _d, ...settingsToCache } = query.data;
```

Destructuring: zero overhead, zero garbage.

### 11. `GlobalJsonLd.tsx`: `SearchAction` z `{search_term_string}` ale brak search na stronie

**Plik:** `src/components/seo/GlobalJsonLd.tsx:80-84`

```ts
potentialAction: {
  "@type": "SearchAction",
  target: `${siteUrl}/${language}/blog?q={search_term_string}`,
  "query-input": "required name={search_term_string}",
},
```

Google może sprawdzić czy URL `${siteUrl}/${language}/blog?q=test` faktycznie działa. Jeśli na blogu nie ma search query param → JSON porzucony przez Google jako błędny. Sprawdź czy `?q=` jest obsługiwane na stronie bloga. Jeśli nie, usuń `potentialAction` albo zaimplementuj podstawowy search.

### 12. Edge functions: brak `Connection: keep-alive` w CORS headers

**Plik:** `supabase/functions/_shared/cors.ts:40-52`

CORS headers nie zawierają `Connection: keep-alive`. Supabase Edge Functions (Deno Deploy) domyślnie używają HTTP/1.1 bez keep-alive w response headers. Browser i tak zarządza połączeniami, ale dodanie `Connection: keep-alive` pozwala na reuse connections do edge functions (redukuje TLS handshake overhead).

**Opcjonalne:** Dodaj `"Connection": "keep-alive"` do `getCorsHeaders`.

### 13. Niezcommitowane zmiany: 69 plików na branchu `fix/mime-csp`

Wszystkie zmiany z poprzednich sprintów (1-4) leżą niezcommitowane. Bez commit+push nic nie żyje na vezvision.com.

---

## ✅ Co jest już świetne (nie ruszać)

1. **React 19 + react-helmet-async v3**: HelmetProvider jest transparent passthrough na React 19, dedup tytułów działa, natively hoistuje meta tags. **Zostaw jak jest.** React 19 native metadata nie obsługuje `defaultTitle` i dedup: Helmet jest potrzebny.
2. **DOMPurify**: gold standard, v3.4.x, hard allowlista z hooks. Tylko bump wersji.
3. **TypeScript strict**: `exactOptionalPropertyTypes`, `noUncheckedSideEffectImports`, `forceConsistentCasingInFileNames`. World-class.
4. **CSP**: `script-src 'self'` (bez nonce, bez unsafe-inline dla scripts), `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.
5. **RLS**: wszystkie 32 tabele, kompletny zestaw policies with `vv_is_admin()`.
6. **AI SEO**: `llms.txt`, `ai.txt`, `.well-known/llm-policies.json`, `robots.txt` z 15 AI botami, sitemap z hreflang + xhtml:link, RSS per locale.
7. **Structured data**: `@graph` z Organization, WebSite (z SearchAction), ProfessionalService, Service, WebPage, BreadcrumbList, BlogPosting, FAQPage, VideoObject, CreativeWork. Kompletne.
8. **Prerendering**: Playwright per-route z `waitForSelector('meta[property="og:title"]')`.
9. **Reveal registry**: shared IntersectionObserver pool, DOM-only `data-revealed`.
10. **Sentry**: explicit GDPR config (`maskAllText`, `blockAllMedia`, `block: [email, tel, textarea]`).
11. **MaintenanceGuard**: fail-closed z cached flag.
12. **CodeInjector**: allowlist meta + link rels, DOMPurify sanitize body, `delayMs = 0`.
13. **Rate limiting**: per-scope (contact 10/min, subscribe 15, unsubscribe 20, blog-view 60, code-injection 30).
14. **Timing-safe auth**: `timingSafeEqual` w retry-message-sends.
15. **Vite**: React Compiler, `esbuild.drop` (console w prod), `lightningcss`, `chunkSizeWarningLimit: 700`, manual chunks.
16. **ESLint**: `no-explicit-any`, `consistent-type-imports`, `jsx-a11y`, type-aware rules.
17. i18n: lazy-loaded per-locale, prefetch alternatywnego locale, sessionStorage cache.
18. Cookie consent: GDPR consent mode v2, fallback to cookie, history tracking.
19. Web Vitals: CLS, INP, LCP, FCP, TTFB to GA.
20. Security headers: HSTS preload, X-Frame-Options DENY, CORP same-site, COOP same-origin.
21. noscript fallback w index.html.
22. prefetch="intent" w Navbar.
23. Route prefetch w Navbar desktop links.
24. Twitter:site, twitter:creator metas.
25. Security.txt z Policy URL.
26. Video files renamed (hero-bg.mp4, footer-bg.mp4).

---

## 📊 Drobne opcjonalne (nie blokują produkcji)

1. **`og-image.png` (20K)**: bardzo mały na 1200×630. Regeneruj na bogatszy per-blog-post.
2. **51 unused exports (knip)**: głównie barrel files (intencjonalne public API). Genuinely unused: `getLocalizedValue` w i18n.ts, `StorageManagerImpl` w storageManager.ts. Można usunąć.
3. **40 unused database indexes (INFO)**: na tabelach admin z 0-1 rows (vv_files, vv_folders, vv_file_events, vv_calendar_events, user_permissions). Harmless. Zostaw dla VezCore jeśli admin panel będzie używał.
4. **`rate_limits` tabela (10 rows)**: legacy, czyszczona przez `cleanup_rate_limits` cron. Zostaw.
5. **Puste tabele CMS**: `vv_page_seo`, `vv_legal_documents`, `vv_page_sections`, `vv_blog_categories`, `vv_project_technologies`, `vv_project_images`: uzupełnij w panelu admin Supabase.
6. **`deno.lock` + `.csp-nonce`**: w `.gitignore` (nie commitowane). Prawidłowe.
7. **`public/robots.txt`**: w `.gitignore` (generowany). Stara wersja leży w repo: usuń z repo lub zcommituj nową.

---

_Review wykonany przez Sisyphus (OhMyOpenCode) z 2026-06-21. Drugi niezależny przegląd._
_Weryfikacja: knip, Supabase MCP (advisors, pg_policies), web search (React 19, DOMPurify, vite-plugin-compression2, llms.txt spec)._
