import { useEffect, useState } from "react";

import { scheduleAfterWindowLoad } from "@/lib/scheduleAfterWindowLoad";

/** Delay hero background video so prerendered logo/H1 remain the LCP element. */
export function useDeferredHeroVideo(): boolean {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => scheduleAfterWindowLoad(() => setShowVideo(true), 4500), []);

  return showVideo;
}
