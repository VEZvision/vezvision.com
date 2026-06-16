import { useContext } from 'react';
import { SmoothScrollContext } from '@/contexts/SmoothScrollContextDefinition';

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
