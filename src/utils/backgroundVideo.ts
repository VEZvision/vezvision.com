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
  // Only rewind on explicit `ended` (fires when loop=false). With loop=true
  // the browser handles the boundary natively and seamlessly — manual
  // currentTime=0 seeks cause a visible stutter at the loop point.
  if (video.ended) {
    video.currentTime = 0;
  }
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

  const onEnded = () => {
    video.currentTime = 0;
    retry();
  };

  const onUnexpectedPause = () => {
    if (document.visibilityState === "visible") {
      retry();
    }
  };

  // `loop=true` suppresses the `ended` event (HTML5 spec), so browsers that
  // pause a muted background video mid-playback (iOS Safari, Chrome battery
  // saver) won't trigger our other recovery listeners.
  // IMPORTANT: do NOT rewind at the loop boundary — loop=true handles that
  // natively and seamlessly. Manual currentTime=0 seeks cause a visible
  // stutter. Only intervene when the video is genuinely stalled (paused or
  // currentTime frozen for reasons other than natural looping).
  let lastTime = video.currentTime;
  const healthCheck = () => {
    if (document.visibilityState !== "visible") return;
    // Check if video is stuck: either paused or stalled (currentTime
    // hasn't moved since last check despite not being paused).
    // Do NOT check for "at end" — loop=true handles the boundary
    // natively and seeking to 0 manually causes a visible stutter.
    const stalled =
      !video.paused &&
      video.currentTime > 0 &&
      Math.abs(video.currentTime - lastTime) < 0.01;
    if (!video.paused && !stalled) {
      lastTime = video.currentTime;
      return;
    }
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    lastTime = 0;
    retry();
  };
  const healthCheckIntervalId = window.setInterval(healthCheck, 2000);

  window.addEventListener("pageshow", retry);
  document.addEventListener("visibilitychange", onVisibilityChange);
  video.addEventListener("ended", onEnded);
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
    video.removeEventListener("ended", onEnded);
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
