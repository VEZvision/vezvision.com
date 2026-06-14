import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollToContact } from '@/hooks/useScrollToContact';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { safeCmsHref } from '@/utils/safeHref';

export function useHeroContactAction(contactHref?: unknown) {
  const normalizedContactHref = typeof contactHref === 'string' ? contactHref : undefined;
  const navigate = useNavigate();
  const scrollToContact = useScrollToContact();
  const { toLocalizedPath } = useLocalizedPath();

  return useCallback(() => {
    const fallback = safeCmsHref(normalizedContactHref, 'contact#kontakt');
    if (fallback.startsWith('#')) {
      scrollToContact();
      return;
    }

    if (scrollToContact()) return;

    void navigate(toLocalizedPath(fallback.replace(/^\//, '')));
  }, [normalizedContactHref, navigate, scrollToContact, toLocalizedPath]);
}
