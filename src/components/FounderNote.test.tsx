import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ReducedMotionProvider } from '@/contexts/ReducedMotionContext';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { ensureLocaleLoaded } from '@/data/translations/loadLocale';
import FounderNote from '@/components/FounderNote';

function renderFounderNote(reducedMotion = false) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  return render(
    <LanguageProvider>
      <ReducedMotionProvider>
        <FounderNote />
      </ReducedMotionProvider>
    </LanguageProvider>,
  );
}

describe('FounderNote', () => {
  beforeEach(async () => {
    await ensureLocaleLoaded('en');
    await ensureLocaleLoaded('pl');

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sets data-revealed on the section when reduced motion is enabled', async () => {
    const { container } = renderFounderNote(true);
    const section = container.querySelector('section');

    await waitFor(() => {
      expect(section?.dataset.revealed).toBe('true');
    });
  });

  it('registers with reveal registry when motion is enabled', async () => {
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 1200,
      bottom: 1400,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const { container } = renderFounderNote(false);
    const section = container.querySelector('section');

    await waitFor(() => {
      expect(observe).toHaveBeenCalledWith(section);
    });
  });
});
