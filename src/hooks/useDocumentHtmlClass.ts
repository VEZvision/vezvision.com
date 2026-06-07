import { useSyncExternalStore } from 'react';

/** Subscribe to a class on `<html>` without forcing React context updates. */
export function useDocumentHtmlClass(className: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const root = document.documentElement;
      const observer = new MutationObserver(onStoreChange);
      observer.observe(root, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains(className),
    () => false,
  );
}
