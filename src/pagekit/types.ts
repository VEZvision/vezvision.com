import type { ComponentType, CSSProperties, LazyExoticComponent } from 'react';

export type SectionComponent =
  | ComponentType<Record<string, unknown>>
  | LazyExoticComponent<ComponentType<Record<string, unknown>>>;

export type SectionRegistryEntry = {
  Component: SectionComponent;
  eager?: boolean;
  props?: Record<string, unknown>;
  minHeight?: string;
};

export type SectionRegistry = Record<string, SectionRegistryEntry>;

import type { BreadcrumbItem } from '@/components/seo/Breadcrumbs';

export type PageShellOptions = {
  className?: string;
  style?: CSSProperties;
  breadcrumbItems?: BreadcrumbItem[];
};
