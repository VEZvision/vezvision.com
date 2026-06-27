import { useEffect, useRef, type RefObject } from "react";

import {
  bindBackgroundVideoPlayback,
  playBackgroundVideo,
} from "@/utils/backgroundVideo";

type UseBackgroundVideoSectionOptions = {
  enabled: boolean;
  sectionRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  initiallyVisible?: boolean;
  threshold?: number;
  rootMargin?: string;
  reloadKey?: string;
  /** When false, media events can trigger play even if IO says off-screen. */
  gateMediaEventsOnVisibility?: boolean;
};

export function useBackgroundVideoSection({
  enabled,
  sectionRef,
  videoRef,
  initiallyVisible = false,
  threshold = 0.05,
  rootMargin,
  reloadKey,
  gateMediaEventsOnVisibility = true,
}: UseBackgroundVideoSectionOptions): void {
  const previousReloadKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled || reloadKey === undefined) return;

    const previousKey = previousReloadKeyRef.current;
    previousReloadKeyRef.current = reloadKey;

    if (previousKey !== undefined && previousKey !== reloadKey) {
      videoRef.current?.load();
    }
  }, [enabled, reloadKey, videoRef]);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;
    if (!videoEl || !enabled) return;

    const isVisibleRef = { current: initiallyVisible };
    const playVideo = () => {
      playBackgroundVideo(videoEl);
    };
    const pauseVideo = () => {
      videoEl.pause();
    };

    const unbindPlayback = gateMediaEventsOnVisibility
      ? bindBackgroundVideoPlayback(videoEl, playVideo, {
          canPlay: () => isVisibleRef.current,
        })
      : bindBackgroundVideoPlayback(videoEl, playVideo);

    if (!sectionEl || !("IntersectionObserver" in window)) {
      isVisibleRef.current = true;
      playVideo();
      return () => {
        unbindPlayback();
        pauseVideo();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          playVideo();
        } else {
          pauseVideo();
        }
      },
      rootMargin === undefined ? { threshold } : { threshold, rootMargin },
    );

    observer.observe(sectionEl);

    if (initiallyVisible) {
      playVideo();
    }

    return () => {
      observer.disconnect();
      unbindPlayback();
      pauseVideo();
    };
  }, [
    enabled,
    gateMediaEventsOnVisibility,
    initiallyVisible,
    reloadKey,
    rootMargin,
    sectionRef,
    threshold,
    videoRef,
  ]);
}
