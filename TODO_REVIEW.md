# TODO — Code Review Implementation

> Lista zadań do wykonania na podstawie `DONAPR.MD`. Odznaczaj po każdym kroku.

## Bezpieczeństwo
- [x] 1. `npm audit fix` — załatanie `@babel/core`, `js-yaml` oraz `dompurify` (wymagało aktualizacji `react-helmet-async` do 3.0.0 i `dompurify` do 3.4.10)
- [x] 2. Wyciągnięcie URL storage z szablonów maili — użyto `Deno.env.get("SUPABASE_URL")` do budowy base URL w `submit-contact/index.ts`
- [x] 3. Generowanie CSP w `.htaccess` i `vercel.json` z env — już istniało (`scripts/sync-security-headers.mjs`); uruchomiono regenerację z `.env`

## Martwy kod / osierocone pliki
- [x] 4. Usunięcie `src/hooks/useNavbarScroll.ts`
- [x] 5. Usunięcie `src/components/navbar/NavbarLinks.tsx`
- [x] 6. Usunięcie `shared/clientIp.ts`, `shared/rateLimitKey.ts` oraz ich testów (`shared/contactValidation.ts` jest używany przez frontend — przywrócony)
- [x] 7. Weryfikacja i usunięcie 8 nieużywanych assetów SVG

## Jakość kodu
- [x] 8. Fix warning ESLint w `src/contexts/SmoothScrollContext.tsx` (kontekst przeniesiony do `SmoothScrollContextDefinition.ts`, hook do `useSmoothScroll.ts`)
- [x] 9. Uproszczenie `SettingsContext.tsx:183-185` (zastąpione `Object.fromEntries` + `Object.entries`)
- [x] 10. Ujednolicenie eksportów na named-only w `reveal/SectionReveal.tsx`
- [x] 11. Ujednolicenie eksportów w komponentach cookie (`CookieBanner`, `CookiePreferences`, `PrivacyCenter`)

## SEO oraz SEO pod AI
- [x] 12. Dynamiczny `<html lang>` (PL/EN) — już obsługiwany przez `SEO.tsx`; dodano RSS linki w tym samym komponencie
- [x] 13. `BreadcrumbList` JSON-LD dla stron ze slugami (BlogArticle, ProjectDetails)
- [x] 14. `Article` schema dla blog postów — już było (`BlogPosting`); dodano BreadcrumbList
- [x] 15. `FAQPage` schema dla sekcji FAQ — już było w `FaqSection.tsx`
- [x] 16. Generowanie `robots.txt` z CMS przy buildzie (`scripts/generate-robots-txt.ts` + `npm run generate-robots-txt`)
- [x] 17. RSS/Atom feed dla bloga (PL + EN) (`scripts/generate-rss-feeds.ts` + `npm run generate-rss-feeds` + linki w `SEO.tsx`)
- [x] 18. Stworzenie `llms.txt` (`public/llms.txt`)

## Wydajność
- [x] 19. Poprawa ładowania fontów — dodano `preconnect` do `cdn.fontshare.com`; `display=swap` już był obecny
- [x] 20. WebM jako pierwszy source dla wideo — zainstalowano `ffmpeg`, przekonwertowano oba pliki MP4 do WebM (VP9) i dodano `<source type="video/webm">` w `Hero`, `Footer`, `VideoHeroSection`
- [x] 21. WebP/AVIF srcset dla zdjęć lokalnych — już zaimplementowane w `Features`, `ValuesSection`, `ProcessSection` przez `vite-imagetools`
- [x] 22. Dynamiczny import `react-markdown` w `LegalMarkdown.tsx` — zastąpiono statyczny import `React.lazy` + `Suspense`

## Baza danych (Supabase migrations)
- [x] 23. Usunięcie / zweryfikowanie 23 unused indexes — przeanalizowano `pg_stat_user_indexes`; bezpieczne duplikaty usunięte
- [x] 24. Połączenie duplikowanych permissive SELECT policies — połączono pary `*_authenticated_read` + `*_public_read` w jedną politykę `*_read` dla `{anon, authenticated}` z warunkiem `admin OR published/active`
- [x] 25. Usunięcie duplikatu indeksu na `vv_blog_post_views` (`vv_blog_post_views_daily_dedup_idx`) oraz nadmiarowego `vv_faq_items_active_order_idx`
- [x] 26. Porządek w migracjach testowych/seedowych — dodano oznaczenia `MIGRATION TYPE: SEED DATA (historical)` do 6 starych migracji seedowych; usunięto pozostały testowy post (`slug = 'testowy-post'`) z `vv_blog_posts`

## CI / Deployment
- [x] 27. Dodanie `scripts/edge-bundles/*.json` do `.gitignore`
- [x] 28. Weryfikacja, że `public/sitemap.xml` trafia do `dist/` po generowaniu — `public/sitemap.xml` jest ignorowany w git, generowany w buildzie, kopiowany do `dist/`
- [x] 29. Rozważenie automatycznego deployu Edge Functions w CI — dodano krok w `.github/workflows/ci.yml` deployujący Edge Functions przez `supabase functions deploy` tylko na `main`/`master`; wymaga ustawienia secrets `SUPABASE_ACCESS_TOKEN` i `SUPABASE_PROJECT_ID`

## Weryfikacja końcowa
- [x] 30. `npm run lint` — zero błędów/zero warningów
- [x] 31. `npm run typecheck` — czysto
- [x] 32. `npm run test:unit` — 86/86
- [x] 33. `npm run build` — sukces
- [x] 34. `npm run check` — sukces
- [x] 35. `npm run check:edge` — sukces po zainstalowaniu Deno; usunięto zbędne `allowJs` z `supabase/functions/deno.json`, brak warningów
- [x] 36. `npm audit --audit-level=moderate` — czysto
