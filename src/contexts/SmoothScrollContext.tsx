import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  destroySmoothScrolling,
  getSmoothScrollMode,
  initSmoothScrolling,
  type SmoothScrollMode,
} from '@/utils/smoothScrolling';

const SCROLL_IDLE_MS = 150;

type SmoothScrollContextValue = {
  mode: SmoothScrollMode;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  mode: 'off',
});

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SmoothScrollMode>('off');
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollingRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const lenis = initSmoothScrolling();
    const activeMode = getSmoothScrollMode();
    setMode(activeMode);

    if (lenis) {
      root.classList.add('vez-smooth-scroll');
      requestAnimationFrame(() => lenis.resize());
    }

    const endScrolling = () => {
      scrollingRef.current = false;
      root.classList.remove('vez-is-scrolling');
      idleTimerRef.current = null;
    };

    const markScrolling = () => {
      if (!scrollingRef.current) {
        scrollingRef.current = true;
        root.classList.add('vez-is-scrolling');
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(endScrolling, SCROLL_IDLE_MS);
    };

    const unsubscribeLenis = lenis?.on('scroll', markScrolling);
    if (!lenis) {
      window.addEventListener('scroll', markScrolling, { passive: true });
    }

    return () => {
      unsubscribeLenis?.();
      if (!lenis) {
        window.removeEventListener('scroll', markScrolling);
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      root.classList.remove('vez-smooth-scroll', 'vez-is-scrolling');
      destroySmoothScrolling();
      setMode('off');
      scrollingRef.current = false;
    };
  }, []);

  const value = useMemo(() => ({ mode }), [mode]);

  return (
    <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
  );
}
