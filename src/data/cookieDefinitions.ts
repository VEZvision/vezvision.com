import { CookieCategoryConfig, CookieDefinition } from '@/types/cookies';

export const COOKIE_DEFINITIONS: CookieDefinition[] = [
    {
        name: 'vezvision_cookie_consent',
        category: 'necessary',
        purpose: 'Stores your cookie consent preferences',
        provider: 'VezVision',
        expiry: '1 year',
        domain: typeof window !== 'undefined' ? window.location.hostname : '',
        isFirstParty: true
    },
    {
        name: 'sb-access-token',
        category: 'necessary',
        purpose: 'Authentication token for Supabase',
        provider: 'Supabase',
        expiry: 'Session',
        domain: typeof window !== 'undefined' ? window.location.hostname : '',
        isFirstParty: true
    },
    {
        name: 'sb-refresh-token',
        category: 'necessary',
        purpose: 'Authentication refresh token for Supabase',
        provider: 'Supabase',
        expiry: 'Session',
        domain: typeof window !== 'undefined' ? window.location.hostname : '',
        isFirstParty: true
    }
];

export const COOKIE_CATEGORIES: CookieCategoryConfig[] = [
    {
        id: 'necessary',
        name: 'Niezbędne',
        description: 'Te pliki cookie są wymagane do poprawnego działania strony. Nie można ich wyłączyć, ponieważ są kluczowe dla bezpieczeństwa i dostępności serwisu.',
        isRequired: true,
        legalBasis: 'Art. 6(1)(b) GDPR — performance of contract / Art. 6(1)(f) GDPR — legitimate interest (consent compliance)',
        cookies: ['vezvision_cookie_consent', 'sb-access-token', 'sb-refresh-token']
    },
    {
        id: 'functional',
        name: 'Funkcjonalne',
        description: 'Umożliwiają zapamiętanie Twoich wyborów (np. język, region) i zapewniają ulepszone, bardziej spersonalizowane funkcje.',
        isRequired: false,
        legalBasis: 'Consent (Art. 6(1)(a) GDPR)',
        cookies: []
    },
    {
        id: 'analytics',
        name: 'Analityczne',
        description: 'Pomagają nam zrozumieć, jak użytkownicy korzystają ze strony, zbierając i raportując informacje anonimowo.',
        isRequired: false,
        legalBasis: 'Consent (Art. 6(1)(a) GDPR)',
        cookies: []
    },
    {
        id: 'marketing',
        name: 'Marketingowe',
        description: 'Używane do śledzenia użytkowników na stronach internetowych. Celem jest wyświetlanie reklam, które są istotne i interesujące dla poszczególnych użytkowników.',
        isRequired: false,
        legalBasis: 'Consent (Art. 6(1)(a) GDPR)',
        cookies: []
    }
];

export const getCookieDefinition = (name: string): CookieDefinition | undefined => {
    return COOKIE_DEFINITIONS.find(def => def.name === name);
};
