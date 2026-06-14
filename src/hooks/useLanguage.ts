import { useState, createContext, useContext, useCallback, useMemo, useEffect } from 'react';

import { getCmsTranslation } from '@/services/cmsTranslationsRegistry';
import {
  detectInitialLanguage,
  ensureLocaleLoaded,
  getCachedLocale,
  prefetchLocale,
  type Language,
} from '../data/translations/loadLocale';

export type { Language };

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  localeReady: boolean;
}

const LANGUAGE_STORAGE_KEY = 'vezvision_language';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);
  const [localeReady, setLocaleReady] = useState(() => Boolean(getCachedLocale(detectInitialLanguage())));

  useEffect(() => {
    let active = true;

    void ensureLocaleLoaded(language).then(() => {
      if (active) setLocaleReady(true);
    });

    prefetchLocale(language === 'pl' ? 'en' : 'pl');

    return () => {
      active = false;
    };
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // localStorage may be unavailable
    }

    setLocaleReady(Boolean(getCachedLocale(lang)));
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const cmsOverride = getCmsTranslation(language, key);
    if (cmsOverride) return cmsOverride;

    const dict = getCachedLocale(language);
    return dict?.[key] ?? key;
  }, [language]);

  return useMemo(() => ({
    language,
    setLanguage,
    t,
    localeReady,
  }), [language, setLanguage, t, localeReady]);
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
