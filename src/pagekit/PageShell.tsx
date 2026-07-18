import type { ReactNode } from 'react';

import PageSeo from '@/components/seo/PageSeo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

import type { PageShellOptions } from './types';

type PageShellProps = PageShellOptions & {
  seoKey: string;
  children: ReactNode;
};

export function PageShell({
  seoKey,
  className,
  style,
  breadcrumbItems,
  children,
}: PageShellProps) {
  const shellClassName = ["relative overflow-x-clip", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName} style={style}>
      <PageSeo pageKey={seoKey} />
      {breadcrumbItems ? <Breadcrumbs items={breadcrumbItems} /> : null}
      <div className="grid-background" aria-hidden />
      {children}
    </div>
  );
}
