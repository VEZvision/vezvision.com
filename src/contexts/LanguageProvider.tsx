import { ReactNode, useEffect } from 'react';
import { LanguageContext, useLanguage } from '../hooks/useLanguage';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const languageHook = useLanguage();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = languageHook.language;
    }
  }, [languageHook.language]);

  return (
    <LanguageContext.Provider value={languageHook}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;