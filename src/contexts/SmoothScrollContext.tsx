import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  destroyLenis,
  getScrollMode,
  initLenis,
  type ScrollMode,
} from '@/scroll';
import { SmoothScrollContext } from './SmoothScrollContextDefinition';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ScrollMode>('native');

  useEffect(() => {
    const root = document.documentElement;
    const lenis = initLenis();
    const activeMode = getScrollMode();
    setMode(activeMode);

    if (lenis) {
      root.classList.add('vez-smooth-scroll');
      requestAnimationFrame(() => lenis.resize());
    }

    return () => {
      root.classList.remove('vez-smooth-scroll');
      destroyLenis();
      setMode('native');
    };
  }, []);

  const value = useMemo(() => ({ mode }), [mode]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}
