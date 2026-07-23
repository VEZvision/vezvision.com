export function ignoreExpectedMediaPlayError(error: unknown): void {
  if (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "NotAllowedError")
  ) {
    return;
  }

  throw error;
}

export function prepareBackgroundVideo(video: HTMLVideoElement): void {
  video.defaultMuted = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("loop", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

function rewindIfAtEnd(video: HTMLVideoElement): void {
  if (video.duration > 0 && video.currentTime >= video.duration - 0.05) {
    video.currentTime = 0;
  }
}

export function playBackgroundVideo(video: HTMLVideoElement): void {
  prepareBackgroundVideo(video);
  // Do NOT rewind here. This function is called from media events
  // (canplay, loadeddata) that fire during normal playback, so
  // rewinding here would stutter. Rewind logic lives only in the
  // recovery handlers below.
  void video.play().catch(ignoreExpectedMediaPlayError);
}

export function installBackgroundVideoRecovery(
  video: HTMLVideoElement,
  onPlay: () => void,
): () => void {
  const retry = () => {
    onPlay();
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      rewindIfAtEnd(video);
      retry();
    }
  };

  const onUnexpectedPause = () => {
    if (document.visibilityState !== "visible") return;
    rewindIfAtEnd(video);
    retry();
  };

  // With preload="auto", muted, and loop="true", most browsers loop
  // cleanly. On iOS Safari / Chrome battery saver the loop boundary
  // can hang: currentTime stops near duration and play() can't restart.
  // We react to the browser's pause event plus a sub-second health
  // check so any hang is imperceptible.
  let lastTime = video.currentTime;
  let staleTicks = 0;
  const healthCheck = () => {
    if (document.visibilityState !== "visible") return;

    const progress = video.currentTime - lastTime;
    const isAdvancing = Math.abs(progress) > 0.001;

    if (video.paused || isAdvancing || video.currentTime <= 0) {
      lastTime = video.currentTime;
      staleTicks = 0;
      return;
    }

    // Video is visible, playing, but currentTime is stuck above 0.
    // Wait for a second consecutive stuck tick to avoid false positives
    // right after the health check starts observing.
    staleTicks++;
    if (staleTicks < 2) return;

    // Stuck at loop boundary. Rewind and resume so the freeze lasts no
    // more than a few hundred milliseconds.
    rewindIfAtEnd(video);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      lastTime = video.currentTime;
      staleTicks = 0;
      retry();
    }
  };
  const healthCheckIntervalId = window.setInterval(healthCheck, 250);

  window.addEventListener("pageshow", retry);
  document.addEventListener("visibilitychange", onVisibilityChange);
  video.addEventListener("stalled", retry);
  video.addEventListener("pause", onUnexpectedPause);
  document.addEventListener("touchstart", retry, { once: true, passive: true });
  document.addEventListener("pointerdown", retry, {
    once: true,
    passive: true,
  });

  return () => {
    window.clearInterval(healthCheckIntervalId);
    window.removeEventListener("pageshow", retry);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    video.removeEventListener("stalled", retry);
    video.removeEventListener("pause", onUnexpectedPause);
    document.removeEventListener("touchstart", retry);
    document.removeEventListener("pointerdown", retry);
  };
}

type BindBackgroundVideoPlaybackOptions = {
  canPlay?: () => boolean;
};

export function bindBackgroundVideoPlayback(
  video: HTMLVideoElement,
  onPlay: () => void,
  options?: BindBackgroundVideoPlaybackOptions,
): () => void {
  const events = ["loadedmetadata", "loadeddata", "canplay"] as const;

  const tryPlay = () => {
    if (options?.canPlay && !options.canPlay()) return;
    onPlay();
  };

  for (const eventName of events) {
    video.addEventListener(eventName, tryPlay);
  }

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    tryPlay();
  }

  return () => {
    for (const eventName of events) {
      video.removeEventListener(eventName, tryPlay);
    }
  };
}
