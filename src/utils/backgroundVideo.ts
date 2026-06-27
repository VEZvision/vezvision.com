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

export function bindBackgroundVideoPlayback(
  video: HTMLVideoElement,
  onPlay: () => void,
): () => void {
  const events = ["loadedmetadata", "loadeddata", "canplay"] as const;

  for (const eventName of events) {
    video.addEventListener(eventName, onPlay);
  }

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    onPlay();
  }

  return () => {
    for (const eventName of events) {
      video.removeEventListener(eventName, onPlay);
    }
  };
}
