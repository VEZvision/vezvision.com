import type { ReactNode } from 'react';

export type RevealOptions = {
  once?: boolean;
  amount?: number;
  rootMargin?: string;
};

export type RevealProps = RevealOptions & {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
};

export type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  staggerIndex?: number;
};
