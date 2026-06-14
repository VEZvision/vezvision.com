import { useEffect, useState } from 'react';

interface UseModalTransitionOptions {
  enterDelay?: number;
  exitDuration?: number;
}

interface UseModalTransitionResult {
  isVisible: boolean;
  isAnimating: boolean;
}

export function useModalTransition(
  show: boolean,
  options: UseModalTransitionOptions = {},
): UseModalTransitionResult {
  const enterDelay = options.enterDelay ?? 10;
  const exitDuration = options.exitDuration ?? 300;

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsAnimating(true), enterDelay);
      return () => clearTimeout(timer);
    }

    setIsAnimating(false);
    const timer = setTimeout(() => setIsVisible(false), exitDuration);
    return () => clearTimeout(timer);
  }, [show, enterDelay, exitDuration]);

  return { isVisible, isAnimating };
}
