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

export function playBackgroundVideo(video: HTMLVideoElement): void {
  prepareBackgroundVideo(video);
  // Do NOT rewind here. This function is called from media events
  // (canplay, loadeddata) that fire during normal playback, so
  // rewinding here would stutter at the loop boundary.
  // Rewind logic lives only in the health check below.
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
      retry();
    }
  };

  const onUnexpectedPause = () => {
    if (document.visibilityState === "visible") {
      retry();
    }
  };

  // With preload="auto", muted, and loop="true", the browser handles
  // buffering and looping natively. On most browsers loop works
  // seamlessly. But on some (iOS Safari, Chrome battery saver),
  // loop=true can fail: the video stalls at currentTime=duration,
  // video.ended stays false (HTML5 spec: loop suppresses ended),
  // and play() can't restart from the end. We detect this by
  // tracking whether currentTime actually advanced between checks.
  let lastTime = video.currentTime;
  const healthCheck = () => {
    if (document.visibilityState !== "visible") return;
    const stalled =
      !video.paused &&
      video.currentTime > 0 &&
      Math.abs(video.currentTime - lastTime) < 0.01;
    if (!video.paused && !stalled) {
      lastTime = video.currentTime;
      return;
    }
    // Video is genuinely stalled or paused. If stalled at the end of
    // the clip (loop=true failed), rewind to 0 so play() can restart.
    // This only fires after 2 seconds of zero progress, so it never
    // triggers during normal looping where currentTime advances.
    if (
      stalled &&
      video.duration > 0 &&
      video.currentTime >= video.duration - 0.05
    ) {
      video.currentTime = 0;
    }
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    lastTime = video.currentTime;
    retry();
  };
  const healthCheckIntervalId = window.setInterval(healthCheck, 2000);

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
