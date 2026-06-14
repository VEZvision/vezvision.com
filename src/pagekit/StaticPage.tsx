import { PageSections, type ResolvedSection } from './PageSections';
import { PageShell } from './PageShell';
import type { PageShellOptions } from './types';

type StaticPageProps = {
  seoKey: string;
  sections: ResolvedSection[];
  shell?: PageShellOptions;
};

/** Fixed section order (not driven by CMS `vv_page_sections`). */
export function StaticPage({ seoKey, sections, shell }: StaticPageProps) {
  return (
    <PageShell seoKey={seoKey} {...shell}>
      <PageSections sections={sections} />
    </PageShell>
  );
}
