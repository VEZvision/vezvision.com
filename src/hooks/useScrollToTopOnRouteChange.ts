import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { scrollToTopInstant, refreshLenis } from "@/scroll";

function getContentPath(pathname: string): string {
  return pathname.replace(/^\/(pl|en)(?=\/|$)/, "") || "/";
}

export function useScrollToTopOnRouteChange() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useLayoutEffect(() => {
    const currentPath = getContentPath(location.pathname);
    if (prevPath.current !== null && prevPath.current === currentPath) return;
    prevPath.current = currentPath;
    scrollToTopInstant();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => refreshLenis());
    });
  }, [location.pathname]);
}
