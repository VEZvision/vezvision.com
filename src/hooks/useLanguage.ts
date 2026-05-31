import { useState, createContext, useContext, useCallback, useMemo } from 'react';

import { getCmsTranslation } from '@/services/cmsTranslationsRegistry';
import { pl, en } from '../data/translations';

export type Language = 'pl' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = { pl, en };
const translationDictionaries: Record<Language, Record<string, string>> = translations;

const LANGUAGE_STORAGE_KEY = 'vezvision_language';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'pl' || stored === 'en') return stored as Language;
      const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) as string[];
      const hasPL = Array.isArray(langs) && langs.some(l => typeof l === 'string' && l.toLowerCase().startsWith('pl'));
      return hasPL ? 'pl' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch {
      // Silent fail for localStorage errors
      setLanguageState(lang);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const cmsOverride = getCmsTranslation(language, key);
    return cmsOverride || translationDictionaries[language][key] || key;
  }, [language]);

  return useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
