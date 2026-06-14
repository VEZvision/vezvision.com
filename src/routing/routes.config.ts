import type { Language } from '@/data/translations/loadLocale';

export type RoutePageKey =
  | 'home'
  | 'about'
  | 'services'
  | 'portfolio'
  | 'blog'
  | 'products'
  | 'contact'
  | 'privacy-policy'
  | 'terms'
  | 'cookie-policy'
  | 'unsubscribe'
  | 'newsletter'
  | 'not-found';

export interface AppRouteDefinition {
  path: string;
  pageKey: RoutePageKey | null;
  sitemap?: {
    changefreq: string;
    priority: number;
  };
  dynamic?: 'blog' | 'portfolio';
}

export const APP_ROUTES: AppRouteDefinition[] = [
  { path: '', pageKey: 'home', sitemap: { changefreq: 'weekly', priority: 1 } },
  { path: 'about', pageKey: 'about', sitemap: { changefreq: 'monthly', priority: 0.8 } },
  { path: 'services', pageKey: 'services', sitemap: { changefreq: 'monthly', priority: 0.8 } },
  { path: 'portfolio', pageKey: 'portfolio', sitemap: { changefreq: 'weekly', priority: 0.9 } },
  { path: 'portfolio/:slug', pageKey: null, dynamic: 'portfolio' },
  { path: 'blog', pageKey: 'blog', sitemap: { changefreq: 'weekly', priority: 0.9 } },
  { path: 'blog/:slug', pageKey: null, dynamic: 'blog' },
  { path: 'newsletter', pageKey: 'newsletter', sitemap: { changefreq: 'monthly', priority: 0.5 } },
  { path: 'products', pageKey: 'products', sitemap: { changefreq: 'monthly', priority: 0.5 } },
  { path: 'contact', pageKey: 'contact', sitemap: { changefreq: 'monthly', priority: 0.7 } },
  { path: 'cookie-policy', pageKey: 'cookie-policy', sitemap: { changefreq: 'yearly', priority: 0.3 } },
  { path: 'privacy-policy', pageKey: 'privacy-policy', sitemap: { changefreq: 'yearly', priority: 0.3 } },
  { path: 'terms', pageKey: 'terms', sitemap: { changefreq: 'yearly', priority: 0.3 } },
  { path: 'unsubscribe', pageKey: 'unsubscribe' },
  { path: '404', pageKey: 'not-found' },
];

export const SUPPORTED_LOCALES: Language[] = ['pl', 'en'];
export const DEFAULT_LOCALE: Language = 'pl';

export function isSupportedLocale(value: string | undefined): value is Language {
  return value === 'pl' || value === 'en';
}

export function getPageKeyFromPath(pathname: string): RoutePageKey | null {
  const segments = pathname.split('/').filter(Boolean);
  const localeOffset = isSupportedLocale(segments[0]) ? 1 : 0;
  const routePath = segments.slice(localeOffset).join('/');

  if (!routePath) return 'home';

  const match = APP_ROUTES.find((route) => {
    if (route.path === routePath) return true;
    if (!route.path.includes(':')) return false;

    const routeParts = route.path.split('/');
    const pathParts = routePath.split('/');
    if (routeParts.length !== pathParts.length) return false;

    return routeParts.every((part, index) => part.startsWith(':') || part === pathParts[index]);
  });

  return match?.pageKey ?? null;
}

export function isDynamicContentPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const localeOffset = isSupportedLocale(segments[0]) ? 1 : 0;
  const routePath = segments.slice(localeOffset).join('/');

  return routePath.startsWith('blog/') || routePath.startsWith('portfolio/');
}
