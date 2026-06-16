import { createContext } from 'react';
import type { ScrollMode } from '@/scroll';

export type SmoothScrollContextValue = {
  mode: ScrollMode;
};

export const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  mode: 'native',
});
