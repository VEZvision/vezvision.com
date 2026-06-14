import { useReducedMotionValue } from '@/contexts/ReducedMotionContext';

/** Single shared media-query listener via ReducedMotionProvider. */
export function useReducedMotion(): boolean {
  return useReducedMotionValue();
}
