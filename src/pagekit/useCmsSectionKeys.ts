import { useMemo } from 'react';

import { usePageSections } from '@/hooks/usePageSection';

export function useCmsSectionKeys(pageKey: string, fallbackKeys: readonly string[]): string[] {
  const cmsSections = usePageSections(pageKey);

  return useMemo(
    () => (cmsSections.length > 0 ? cmsSections.map((section) => section.section_key) : [...fallbackKeys]),
    [cmsSections, fallbackKeys],
  );
}
