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
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

export function playBackgroundVideo(video: HTMLVideoElement): void {
  prepareBackgroundVideo(video);
  void video.play().catch(ignoreExpectedMediaPlayError);
}

export function installBackgroundVideoRecovery(
  _video: HTMLVideoElement,
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

  window.addEventListener("pageshow", retry);
  document.addEventListener("visibilitychange", onVisibilityChange);
  document.addEventListener("touchstart", retry, { once: true, passive: true });
  document.addEventListener("pointerdown", retry, {
    once: true,
    passive: true,
  });

  return () => {
    window.removeEventListener("pageshow", retry);
    document.removeEventListener("visibilitychange", onVisibilityChange);
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
