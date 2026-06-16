# Code Review — VezVision Website

> Zakres: całe repo (`src/`, `supabase/`, `scripts/`, `public/`, konfiguracja, CI, baza Supabase).
> Metoda: statyczna analiza (ESLint, TypeScript, Vitest, npm audit, Knip), review kluczowych plików, inspekcja projektu Supabase `vezvisionWEB` (`pcxcqbpygyidkusetghk`).
> Data: 2026-06-15.

---

## 1. Executive summary

Projekt jest **bardzo dojrzały produkcyjnie** — TypeScript strict, zero błędów typów, 92/92 testów jednostkowych przechodzi, build produkcyjny przechodzi, ESLint przechodzi (1 warning), CSP/RLS/rate-limiting są wdrożone, a architektura (pagekit, CMS settings, cookie consent, maintenance guard) jest przemyślana.

Nie ma krytycznych dziur bezpieczeństwa, które mogłyby zostać wykorzystane przez anonima. Główne obszary do poprawy to: **martwy kod/assety**, **porządek w migracjach**, **drobne optymalizacje bazy** oraz **uszczelnienie SEO pod AI / LLM crawlers**.

---

## 2. Bezpieczeństwo kodu i bazy danych

### 2.1 Co działa dobrze

- **RLS jest włączony na wszystkich tabelach publicznych** (sprawdzono `pg_class.relrowsecurity`).
- **Wrażliwe zapisy (kontakt, newsletter) przechodzą wyłącznie przez Edge Functions z service-role key**:
  - `safe_insert_contact_message` i `safe_insert_newsletter_subscriber` mają `EXECUTE` tylko dla `service_role` i `postgres`.
  - `anon`/`authenticated` nie mają bezpośredniego dostępu do tych RPC.
- **Tabela `messages`** (przechowuje dane kontaktowe): RLS ON, polityki tylko `service_role INSERT` i `authenticated SELECT via vv_is_admin()`.
- **Tabela `vv_newsletter_subscribers`**: RLS ON, polityka tylko admin.
- **Tabela `vv_blog_post_views`**: RLS ON, polityka `service_role` only.
- **Edge Functions** mają rate-limiting (`consume_rate_limit`), CORS, Turnstile, walidację wejścia i HTML-escape w szablonach maili.
- **CMS code injection** jest ograniczony do dozwolonych tagów `meta`/`link` (whitelist rel) i ciała przepuszczonego przez DOMPurify z whitelistą tagów/atrybutów.
- **CSP** jest zdefiniowane w `public/.htaccess` i `vercel.json` (choć oba mają problem opisany niżej).
- **Anon key jest publiczny z założenia** (zmienna `VITE_`), a service-role key nigdy nie trafia do frontendu.

### 2.2 Znaleziska i rekomendacje

| # | Poziom | Opis | Plik / miejsce | Rekomendacja |
|---|--------|------|----------------|--------------|
| 2.2.1 | **Low** | Hardcoded URL Supabase w szablonach maili kontaktowych. | `supabase/functions/submit-contact/index.ts:59,126,144-146` | Wyciągnij domenę storage do zmiennej środowiskowej (`STORAGE_PUBLIC_URL`) lub użyj `SUPABASE_URL`. Nie blokujące, ale utrudnia migrację/środowisko staging. |
| 2.2.2 | **Low** | Hardcoded URL Supabase w CSP `.htaccess` i `vercel.json`. | `public/.htaccess:37`, `vercel.json:28` | Generuj CSP przy buildzie (skrypt `scripts/sync-security-headers.mjs` już istnieje — sprawdź czy faktycznie podmienia `.htaccess` na podstawie `.env`). Dzięki temu staging będzie miał własne `connect-src`. |
| 2.2.3 | **Info** | `npm audit` wykrywa 2 podatności w transitive deps: `@babel/core` (arbitrary file read) oraz `js-yaml` (DoS). | `package-lock.json` | Uruchom `npm audit fix` i zweryfikuj build/testy. Obie mają dostępne łatki. |
| 2.2.4 | **Info** | `rate_limit_buckets` ma RLS ON ale brak polityk — to celowe (dostęp tylko przez `service_role`/`SECURITY DEFINER`), ale Supabase advisor to flaguje. | `public.rate_limit_buckets` | Rozważ dodanie jawnej polityki `service_role` dla przejrzystości (lub potraktuj jako akceptowane). |
| 2.2.5 | **Info** | Brak jawnego `GRANT` na `vv_site_settings` itp. dla `anon` — działa przez RLS, ale warto upewnić się, że `anon` ma `USAGE` na schemacie i `SELECT` na tabelach publicznych. | Baza | Przejrzyj uprawnienia ról w kolejnej migracji porządkowej. |

### 2.3 Decyzje architektoniczne do przedyskutowania

- **Single Supabase project (`vezvisionWEB`)** dla strony marketingowej i VezCore admin/CRM. To bezpieczne przy RLS, ale oznacza, że migracje website i VezCore żyją w jednym kubełku. Warto mieć jasny podział odpowiedzialności (opisany dobrze w `docs/migrations.md`).
- **Edge Function `send-newsletter`** jest wdrożona w projekcie, ale celowo nie ma jej w repo — OK, ale upewnij się, że jej tajemnice nie są resetowane przy deployu strony.

---

## 3. Martwy kod i osierocone pliki

### 3.1 Potwierdzone martwe pliki (żaden import produkcyjny)

| Plik | Uwagi |
|------|-------|
| `src/hooks/useNavbarScroll.ts` | Navbar ma własną logikę scrollu w `src/components/navbar/Navbar.tsx:41-59`. |
| `src/components/navbar/NavbarLinks.tsx` | Navbar renderuje linki inline; komponent nigdzie nie jest importowany. |
| `shared/clientIp.ts` | Edge functions mają własną kopię `supabase/functions/_shared/clientIp.ts`. |
| `shared/contactValidation.ts` | Edge functions mają `supabase/functions/_shared/contactValidation.ts`; frontend ma `src/utils/contactValidation.ts`. |
| `shared/rateLimitKey.ts` | Edge functions mają własną kopię `supabase/functions/_shared/rateLimitKey.ts`. |
| `shared/clientIp.test.ts` | Testy martwej kopii. |
| `shared/contactValidation.test.ts` | Testy martwej kopii. |
| `shared/rateLimitKey.test.ts` | Testy martwej kopii. |

**Rekomendacja:** usunąć powyższe pliki. Jeśli chcesz zachować jedną wspólną implementację, wtedy edge functions powinny importować z `shared/` (ale wtedy trzeba skonfigurować Deno import map), a nie trzymać ręcznie synchronizowane kopie.

### 3.2 Niepotwierdzone martwe assety (najprawdopodobniej nieużywane)

| Asset | Uwagi |
|-------|-------|
| `src/assets/features/ai-support-icon.svg` | W `Features.tsx` używane są ikony z `lucide-react` (`BrainCircuit`, `Globe`, `TrendingUp`, `Zap`). |
| `src/assets/features/automation-icon.svg` | jak wyżej |
| `src/assets/features/marketing-icon.svg` | jak wyżej |
| `src/assets/features/web-apps-icon.svg` | jak wyżej |
| `src/assets/logo-text-only.svg` | Brak importu w całym `src/`. |
| `src/assets/services/group23/chart-line.svg` | `Group23Section.tsx` nie importuje tych SVG. |
| `src/assets/services/group23/chart-mask.svg` | jak wyżej |
| `src/assets/social-x.svg` | Stopka używa prawdopodobnie innych ikon/inline SVG. |

**Rekomendacja:** zweryfikować i usunąć. Każdy nieużywany asset to mniejszy repo i mniejszy czas buildu.

### 3.3 Nieużywane eksporty (Knip) — do rozważenia

- `src/hooks/useSettings.ts`: `useContact`, `useSeo`, `useMaintenance`.
- `src/lib/logger.ts`: `logWarn`, `logInfo`.
- `src/lib/sentryConsent.ts`: `hasAnalyticsConsentFromStorage`.
- `src/scroll/*`: wiele funkcji eksportowanych, ale tylko część używana.
- `src/utils/safeHref.ts`: `isSafeHref`, `isSafePublicHref`.
- `src/reveal/index.ts`: eksportuje dużo, ale nie wszystko jest używane bezpośrednio.

Nie są to błędy — w wielu przypadkach to publiczne API. Warto jednak przejrzeć listę i usunąć to, co naprawdę nie jest potrzebne.

### 3.4 Duplikaty nazw eksportów

- `shared/contactValidation.ts` i `supabase/functions/_shared/contactValidation.ts` — oba mają `normalizeContactText` i alias `normalizeText`.
- Komponenty eksportują zarówno nazwaną funkcję, jak i `default` (`CookieBanner`, `PrivacyCenter`, `SectionReveal`, `LanguageProvider`).

To nie jest błąd, ale można uprościć do jednej konwencji (najlepiej named exports, aby uniknąć podwójnych importów).

---

## 4. Architektura i jakość kodu

### 4.1 Mocne strony

- **TypeScript strict mode** — zero błędów (`npm run typecheck` OK).
- **Dobra separacja warstw**: `services/` (data), `hooks/` (React Query), `components/` (UI), `pagekit/` (CMS-driven pages), `reveal/` / `scroll/` (interakcje).
- **SettingsContext** dobrze ładuje ustawienia publiczne, cache-uje je w `localStorage`, synchronizuje przez Realtime i obsługuje stan degraded.
- **MaintenanceGuard** działa w trybie *fail-closed* z fallbackiem do bazy danych.
- **SEO** jest scentralizowane w `PageSeo.tsx` / `DynamicPageSeo.tsx` / `GlobalJsonLd.tsx` z JSON-LD, hreflang, canonical, OG/Twitter.
- **Cookie consent** jest granularny, zgody gatingują Sentry i GA, zgodny z a11y.
- **Formularz kontaktowy** ma etykiety, `aria-invalid`, `aria-describedby`, `role="alert"` — dobry poziom accessibility.
- **Testy jednostkowe** pokrywają walidację, sanitizację, cookie consent, błędy, maintenance, SEO, translacje.

### 4.2 Juniorskie / nowatorskie rozwiązania do poprawy

| # | Plik | Opis | Rekomendacja |
|---|------|------|--------------|
| 4.2.1 | `src/contexts/SettingsContext.tsx:183-185` | `const { error: _, degraded: __, ...settingsToCache } = query.data; void _; void __;` | Zamiast pustych `void`, użyj destrukturyzacji z pominięciem: `const settingsToCache = (({ error, degraded, ...rest }) => rest)(query.data);` lub dedykowanej funkcji. |
| 4.2.2 | `supabase/functions/submit-contact/index.ts:320,336,353` | Wysyłka maili i webhook są odpalane bez `await`, z `.catch(() => console.error(...))`. | Jest to celowe ("fire and forget"), ale zalecam dodanie struktury logowania/retriów (np. tabela `message_send_logs`) zamiast `console.error` w produkcji. |
| 4.2.3 | `src/utils/safeHref.ts` i inne | `as unknown as DBProject` w 3 miejscach (`services/portfolio.ts`, `services/servicesContent.ts`, `services/pageSeo.ts`). | Nie jest to tłumienie błędów, tylko mapowanie z Supabase — akceptowalne, ale można zastąpić runtime walidacją/Zod dla pełnego bezpieczeństwa typów. |
| 4.2.4 | `src/components/ui/SectionReveal.tsx` | Jest tylko re-exportem z `src/reveal/`. | Nie martwy, ale można usunąć ten plik proxy i importować bezpośrednio z `@/reveal` albo z `@/components/ui/SectionReveal` — trzeba tylko ustalić jedną konwencję. |
| 4.2.5 | `src/reveal/SectionReveal.tsx:127` | `export default SectionReveal` + named export. | Ujednolicić na named exports w całym module. |
| 4.2.6 | `src/main.tsx` | `window.history.scrollRestoration = 'manual';` jest globalny. | Upewnij się, że działa z `useScrollToTopOnRouteChange` i nie psuje pozycji przy błędach / przeładowaniu. |

### 4.3 Lint / TypeScript

- `npm run lint` — 1 warning: `src/contexts/SmoothScrollContext.tsx:25` (`react-refresh/only-export-components`).
  - Rozwiązanie: wyciągnij `useSmoothScroll` do osobnego pliku `hooks/useSmoothScroll.ts` lub dodaj `eslint-disable-next-line` z uzasadnieniem.
- `npm run typecheck` — czysto.
- `npm run test:unit` — 92/92 OK.

---

## 5. Wydajność i optymalizacja

### 5.1 Build / bundle

- Produkcja buduje się w ~3.9s.
- Chunkowanie w `vite.config.ts` jest dobrze przemyślane: `vendor-react`, `vendor-router`, `vendor-supabase`, `vendor-markdown`, `vendor-zod`, `vendor-lenis`, itp.
- Brotli/gzip są generowane przez `vite-plugin-compression2`.
- `.htaccess` serwuje `.br`/`.gz` z odpowiednim `Content-Encoding`.

### 5.2 Obserwacje

| # | Opis | Rekomendacja |
|---|------|--------------|
| 5.2.1 | `vendor-react` to 257 kB / 81 kB gzip. Dla SPA z React 19 to sporo, ale akceptowalne. | Rozważ **React Compiler** (obecnie eksperymentalny, ale stabilizuje się) lub zmniejszenie re-renderów poprzez podział `SettingsContext` na mniejsze konteksty (np. `SeoContext`, `NavigationContext`). |
| 5.2.2 | `vendor-supabase` to 209 kB / 54 kB gzip. | Jeśli używasz tylko `supabase-js` do funkcji i SELECT, rozważ `import { createClient }` zamiast pełnego bundle lub tree-shaking nieużywanych modułów realtime. |
| 5.2.3 | `vendor-markdown` (react-markdown + unified) to 117 kB / 36 kB gzip. | Używany tylko jeśli CMS zawiera markdown. Jeśli większość treści to HTML z CMS, można przenieść `react-markdown` do dynamic importu. |
| 5.2.4 | `vendor-zod` to 58 kB / 14 kB gzip — używany tylko w formularzu kontaktowym. | Rozważ przeniesienie walidacji formularza do czystego TypeScript lub `valibot` (znacznie mniejszy), jeśli rozmiar ma znaczenie. |
| 5.2.5 | Obrazki w `src/assets/` to głównie PNG. | Upewnij się, że `vite-imagetools` generuje WebP/AVIF srcset dla wszystkich zdjęć (już robione dla niektórych). PNG nie powinny być serwowane bez formatów nowej generacji. |
| 5.2.6 | Wideo w `public/` są duże (MP4). | Dostarczaj `webm` jako pierwszy source (lepsza kompresja) i `mp4` jako fallback. Dodaj `preload="none"` lub `poster`, jeśli wideo nie jest krytyczne dla LCP. |
| 5.2.7 | `index.html` ładuje fonty z `api.fontshare.com` synchronie (`rel="stylesheet"`). | Rozważ `preload` + `font-display: swap` oraz self-hosting fontów, aby uniknąć SPOF i poprawić LCP. |

### 5.3 Lighthouse

Nie udało się uruchomić Lighthouse lokalnie (brak Chromium). **Rekomendacja:** uruchom `lighthouse` na produkcji lub użyj PageSpeed Insights / WebPageTest. Monitoruj LCP, TBT, CLS oraz INP.

---

## 6. SEO oraz SEO pod AI

### 6.1 Co już jest świetne

- JSON-LD: Organization, WebSite, WebPage, ProfessionalService/LocalBusiness.
- Hreflang + `x-default` dla PL/EN.
- Canonical URLs per page.
- OG / Twitter Cards.
- `robots` per page z CMS (`indexable` flaga).
- Sitemap generowany z CMS (`blog`, `portfolio`, static pages).
- Meta description, OG image fallback do logo.

### 6.2 World-class SEO pod AI — rekomendacje

| # | Obszar | Rekomendacja | Priorytet |
|---|--------|--------------|-----------|
| 6.2.1 | **AI-readable content** | Upewnij się, że każda strona ma jeden H1, logiczną hierarchię nagłówków (H1→H2→H3) i unikalne `<title>`/`<meta name="description">`. Nie stosuj `display: none` na kluczowej treści. | High |
| 6.2.2 | **Structured data expansion** | Dodaj `BreadcrumbList` JSON-LD dla stron z slugami (`blog/:slug`, `portfolio/:slug`) i `Article` schema dla blog postów (z `author`, `datePublished`, `dateModified`, `image`). | High |
| 6.2.3 | **Entity / Knowledge Graph** | W `GlobalJsonLd` dodaj `@id` dla Organization i Website oraz `sameAs` do wszystkich profili społecznościowych (LinkedIn, X, Instagram, GitHub). Rozważ rejestrację w Google Knowledge Graph / Wikidata. | Medium |
| 6.2.4 | `robots.txt` z CMS | Obecnie `public/robots.txt` jest statyczny, ale CMS ma pole `seo_files.robotsTxt`. Generuj `robots.txt` przy buildzie (`generate-sitemap` jest już w CI — dodaj analogiczny krok). | Medium |
| 6.2.5 | **RSS / Atom feed** | Dodaj `/pl/blog/feed.xml` i `/en/blog/feed.xml`. AI crawlers i news aggregatory często konsumują feedy. | Medium |
| 6.2.6 | **LLM.txt / robots.txt dla AI** | Rozważ dodanie `llms.txt` (projektowany standard) z podsumowaniem firmy, oferty i linkami do kluczowych treści. W `robots.txt` możesz dodać sekcję `User-agent: GPTBot` / `User-agent: ChatGPT-User` / `User-agent: PerplexityBot` z `Allow: /` oraz link do `llms.txt`. | Medium |
| 6.2.7 | **Internal linking** | W treści CMS (blog, portfolio) automatycznie linkuj do powiązanych artykułów/usług. AI lepiej rozumie kontekst, gdy linki są semantyczne. | Medium |
| 6.2.8 | **FAQ schema** | `FaqSection` zawiera pytania/odpowiedzi — dodaj `FAQPage` JSON-LD generowany z tych danych. | Medium |
| 6.2.9 | **Video schema** | Jeśli wideo są kluczowe, dodaj `VideoObject` schema z `thumbnailUrl`, `uploadDate`, `description`. | Low |
| 6.2.10 | **Performance = ranking** | AI search (Google SGE, Perplexity, ChatGPT search) faworyzuje szybkie, dobrze zrenderowane strony. Priorytet: LCP < 2.5s, CLS < 0.1, INP < 200ms. | High |
| 6.2.11 | **Canonical self-referencing** | Upewnij się, że każda strona ma canonical na siebie (już robione), a parametry query (`?utm_source=...`) są ignorowane przez canonical. | Low |

### 6.3 SEO techniczne do poprawy

- `<html lang="pl">` jest hardcoded w `index.html`. React Helmet powinien dynamicznie ustawiać `lang="pl"` / `lang="en"` w zależności od route.
- `public/robots.txt` nie wykorzystuje `seo_files.robotsTxt` z CMS.
- Brak `lastmod` w sitemap dla static pages — jest tylko data buildu; dla blog/portfolio jest `updated_at`.

---

## 7. Supabase i baza danych

### 7.1 Migracje

- W repo jest **105 plików migracji**. Wiele z nich to migracje naprawcze z listopada 2024 (`fix_rls_*`, `simplify_*`, `insert_test_*`), co sugeruje iteracyjny rozwój.
- To **nie jest błąd** — migracje są idempotentne i chronią historię.
- **Rekomendacja:** rozważ fazę porządkową po stabilizacji VezCore:
  - Połącz migracje dotyczące jednej tabeli w jedną baseline migration (tylko dla nowych środowisk, nigdy nie modyfikuj już zaaplikowanych migracji).
  - Usuń migracje `insert_test_*` / `insert_sample_*` z głównej gałęzi lub przenieś je do osobnego katalogu `seed/`.

### 7.2 Performance bazy (Supabase Advisor)

| Typ | Szczegóły | Rekomendacja |
|-----|-----------|--------------|
| **Unused indexes** | 23 nieużywane indeksy, m.in. `vv_faq_items_category_id_idx`, `vv_newsletter_subscribers_active_idx`, `idx_vv_blog_posts_scheduled`, `idx_user_permissions_*`, `vv_folders_owner_idx`, itp. | Przeanalizuj i usuń te, które nie będą potrzebne. Niektóre mogą być nowe (stats mogą być jeszcze zimne). |
| **Multiple permissive policies** | `vv_blog_posts`, `vv_blog_post_categories`, `vv_faq_categories`, `vv_faq_items` mają po 2 permissive SELECT policies dla `authenticated`. | Połącz w jedną politykę `(vv_is_admin() OR <public_condition>)` aby uniknąć wykonywania 2 warunków na każdy SELECT. |
| **Duplicate index** | `vv_blog_post_views` ma identyczne indeksy `vv_blog_post_views_daily_dedup_idx` i `vv_blog_post_views_slug_ip_day_idx`. | Usuń jeden z nich. |
| **RLS enabled no policy** | `public.rate_limit_buckets` ma RLS ON bez polityk. | Akceptowalne (dostęp tylko przez `service_role`), ale można dodać jawną politykę dla klarowności. |

### 7.3 Czyszczenie / retention

- `cleanup_rate_limit_buckets(interval '7 days')` istnieje — dobrze.
- Rozważ retencję dla `messages` (np. archiwizacja po X latach) oraz `vv_blog_post_views` (agregacja dzienników).

---

## 8. CI / CD / Deployment

### 8.1 Co działa dobrze

- GitHub Actions z lint, typecheck, unit tests, edge typecheck, edge tests, build, npm audit, artifact upload.
- Playwright E2E jako osobny job z retries.
- Sitemap generowany tylko na `main`/`master` z production secrets.

### 8.2 Rekomendacje

| # | Opis | Rekomendacja |
|---|------|--------------|
| 8.2.1 | `edge-bundles/` są commitowane do repo. | Dodaj `scripts/edge-bundles/*.json` do `.gitignore` (są to build artifacts). Skrypty `sync-edge-bundles.mjs` i `verify-edge-bundles.mjs` mogą je regenerować w CI. |
| 8.2.2 | `public/sitemap.xml` jest w `.gitignore` — dobrze. | Upewnij się, że po `npm run generate-sitemap` plik jest kopiowany do `dist/` przed deployem. |
| 8.2.3 | `npm audit --audit-level=moderate` failuje CI przy podatnościach. | Dobre — utrzymaj. Tylko regularnie `npm audit fix`. |
| 8.2.4 | Brak joba deploy Edge Functions w CI. | Rozważ automatyczny deploy `supabase functions deploy` po merge do `main` (z odpowiednimi secrets). Obecnie deploy jest ręczny przez MCP/skrypty. |
| 8.2.5 | `E2E_BUILD=1` vs normalny build. | Dobrze izolowane — route `__e2e__/error` nie trafia do produkcji. |

---

## 9. Top priority action items

1. **Bezpieczeństwo / utrzymanie**
   - [ ] `npm audit fix` i ponowne uruchomienie testów.
   - [ ] Wyciągnięcie URL Supabase z `.htaccess`/`vercel.json` CSP do generowanego przy buildzie.
   - [ ] Wyciągnięcie URL storage z szablonów maili do zmiennej env.

2. **Martwy kod**
   - [ ] Usunięcie `src/hooks/useNavbarScroll.ts` i `src/components/navbar/NavbarLinks.tsx`.
   - [ ] Usunięcie `shared/clientIp.ts`, `shared/contactValidation.ts`, `shared/rateLimitKey.ts` (z testami) lub zrefaktoryzowanie edge functions, by z nich korzystały.
   - [ ] Weryfikacja i usunięcie 8 podejrzanych assetów SVG.

3. **Jakość kodu**
   - [ ] Fix warning ESLint w `SmoothScrollContext.tsx`.
   - [ ] Uproszczenie `SettingsContext.tsx:183-185`.
   - [ ] Ujednolicenie eksportów na named-only w `reveal/SectionReveal.tsx` i komponentach cookie.

4. **Baza danych**
   - [ ] Usunięcie / zweryfikowanie unused indexes (23 szt.).
   - [ ] Połączenie duplikowanych permissive SELECT policies.
   - [ ] Usunięcie duplikatu indeksu na `vv_blog_post_views`.
   - [ ] Porządek w migracjach testowych/seedowych (opcjonalnie).

5. **SEO pod AI**
   - [ ] Dynamiczny `<html lang>`.
   - [ ] `BreadcrumbList` + `Article` schema dla bloga i portfolio.
   - [ ] Generowanie `robots.txt` z CMS.
   - [ ] RSS feed dla bloga (PL + EN).
   - [ ] Stworzenie `llms.txt`.
   - [ ] `FAQPage` schema dla sekcji FAQ.

6. **Wydajność**
   - [ ] PageSpeed Insights / Lighthouse na produkcji.
   - [ ] Self-hosting fontów lub preload + swap.
   - [ ] Dostarczanie WebM dla wideo.
   - [ ] Rozważenie `valibot` zamiast `zod` lub dynamicznego importu `react-markdown`.

---

## 10. Podsumowanie ogólnej oceny

| Kategoria | Ocena |
|-----------|-------|
| Bezpieczeństwo kodu | **A** (solidne RLS, CSP, walidacja, rate-limiting) |
| Bezpieczeństwo bazy | **A-** ( drobne porządki w indexach/policies) |
| Jakość kodu / TS | **A-** (1 lint warning, drobne niedociągnięcia stylistyczne) |
| Architektura | **A** (dobrze podzielone warstwy, CMS-driven) |
| Testy / CI | **A** (92 unit + E2E + edge + audit) |
| SEO techniczne | **A-** (bardzo dobrze, ale brak dynamicznego lang i AI-specific features) |
| SEO pod AI | **B+** (brak llms.txt, RSS, Article schema, FAQPage schema) |
| Wydajność | **B+** (dobre chunkowanie, ale duże vendor chunks; wymaga Lighthouse) |
| Porządek repo | **B+** (martwy kod w `shared/`, `edge-bundles/` w repo, stare migracje) |

**Ogólna ocena: A-** — projekt jest produkcyjny i bezpieczny. Rekomendacje powyżej pozwolą wejść na poziom **A / A+** oraz poprawić widoczność w AI search.
