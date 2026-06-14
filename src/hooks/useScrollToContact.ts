import { useCallback } from 'react';
import { scrollToElement } from '@/scroll';

const DEFAULT_CONTACT_SECTION_IDS = ['kontakt', 'contact-form-section'];

export function useScrollToContact(sectionIds: string[] = DEFAULT_CONTACT_SECTION_IDS) {
  return useCallback((): boolean => {
    const section = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .find((element): element is HTMLElement => Boolean(element));

    if (!section) return false;

    scrollToElement(section, { offset: -96, behavior: 'smooth' });
    return true;
  }, [sectionIds]);
}
