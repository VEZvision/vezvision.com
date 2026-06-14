import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type RoutePageKey,
} from '@/routing/routes.config';
import type { Language } from '@/data/translations/loadLocale';

export function localizedPath(language: Language, path = ''): string {
  const normalized = path.replace(/^\/+/, '');
  return normalized ? `/${language}/${normalized}` : `/${language}`;
}

export function getLocaleFromPathname(pathname: string): Language | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  if (!isSupportedLocale(segments[0])) return pathname.startsWith('/') ? pathname : `/${pathname}`;

  const rest = segments.slice(1).join('/');
  return rest ? `/${rest}` : '/';
}

export function switchLocalePath(pathname: string, nextLanguage: Language): string {
  const pathWithoutLocale = stripLocaleFromPathname(pathname);
  if (pathWithoutLocale === '/') return localizedPath(nextLanguage);
  return localizedPath(nextLanguage, pathWithoutLocale.replace(/^\//, ''));
}

export function resolveLocaleRedirect(pathname: string, preferred: Language = DEFAULT_LOCALE): string {
  const locale = getLocaleFromPathname(pathname);
  if (locale) return pathname;

  if (pathname === '/') return localizedPath(preferred);
  const suffix = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return localizedPath(preferred, suffix);
}

export function localizeInternalHref(href: string, language: Language): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const hashIndex = href.indexOf('#');
  const pathname = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    return href;
  }

  const suffix = segments.join('/');
  return `${localizedPath(language, suffix)}${hash}`;
}

export function buildLocalizedStaticPaths(language: Language, pageKey: RoutePageKey): string[] {
  switch (pageKey) {
    case 'home':
      return [localizedPath(language)];
    default:
      return [localizedPath(language, pageKey)];
  }
}
