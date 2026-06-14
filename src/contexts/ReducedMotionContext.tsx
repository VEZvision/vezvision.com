/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const ReducedMotionContext = createContext(false);

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);

    setReducedMotion(query.matches);
    query.addEventListener('change', handleChange);

    return () => query.removeEventListener('change', handleChange);
  }, []);

  return (
    <ReducedMotionContext.Provider value={reducedMotion}>{children}</ReducedMotionContext.Provider>
  );
}

export function useReducedMotionValue(): boolean {
  return useContext(ReducedMotionContext);
}
