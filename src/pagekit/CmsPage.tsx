import { useMemo } from 'react';

import { PageSections, type ResolvedSection } from './PageSections';
import { PageShell } from './PageShell';
import type { PageShellOptions, SectionRegistry } from './types';
import { useCmsSectionKeys } from './useCmsSectionKeys';

type CmsPageProps = {
  pageKey: string;
  seoKey?: string;
  fallbackKeys: readonly string[];
  sections: SectionRegistry;
  shell?: PageShellOptions;
};

export function CmsPage({ pageKey, seoKey, fallbackKeys, sections, shell }: CmsPageProps) {
  const keys = useCmsSectionKeys(pageKey, fallbackKeys);

  const resolvedSections = useMemo(
    () =>
      keys
        .map((key): ResolvedSection | null => {
          const entry = sections[key];
          if (!entry) return null;
          return { key, ...entry };
        })
        .filter((entry): entry is ResolvedSection => entry !== null),
    [keys, sections],
  );

  return (
    <PageShell seoKey={seoKey ?? pageKey} {...shell}>
      <PageSections sections={resolvedSections} />
    </PageShell>
  );
}
