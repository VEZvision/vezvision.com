import { useCallback } from 'react';
import { useLanguageContext } from '@/hooks/useLanguage';
import { localizedPath } from '@/routing/locale';

export function useLocalizedPath() {
  const { language } = useLanguageContext();

  const toLocalizedPath = useCallback(
    (path = '') => localizedPath(language, path.replace(/^\//, '')),
    [language],
  );

  return { toLocalizedPath, language };
}
