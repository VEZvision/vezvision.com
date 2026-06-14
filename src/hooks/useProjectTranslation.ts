import { useCallback } from 'react';
import type { PortfolioProject, ProjectTranslation } from '@/types/portfolio';

export function useProjectTranslation(
  project: PortfolioProject | null,
  language: 'pl' | 'en',
) {
  const t = useCallback(
    (key: keyof ProjectTranslation, defaultText: string): string => {
      if (!project?.translations) return defaultText;
      const translation = project.translations[language];
      if (!translation) return defaultText;
      const value = translation[key];
      if (Array.isArray(value)) {
        return value.join(', ') || defaultText;
      }
      return value && value.trim() !== '' ? value : defaultText;
    },
    [project, language],
  );

  return t;
}
