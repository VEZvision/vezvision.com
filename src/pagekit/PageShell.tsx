import type { ReactNode } from 'react';

import PageSeo from '@/components/seo/PageSeo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

import type { PageShellOptions } from './types';

type PageShellProps = PageShellOptions & {
  seoKey: string;
  children: ReactNode;
};

export function PageShell({ seoKey, className, style, breadcrumbItems, children }: PageShellProps) {
  return (
    <div className={className} style={style}>
      <PageSeo pageKey={seoKey} />
      {breadcrumbItems ? <Breadcrumbs items={breadcrumbItems} /> : null}
      <div className="grid-background" aria-hidden />
      {children}
    </div>
  );
}
