import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  installBackgroundVideoRecovery,
  playBackgroundVideo,
  prepareBackgroundVideo,
} from "./backgroundVideo";

describe("backgroundVideo", () => {
  it("always prepares decorative videos for muted inline looping", () => {
    const video = document.createElement("video");

    prepareBackgroundVideo(video);

    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.hasAttribute("loop")).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
  });

  it("does not rewind during normal play (stutter prevention)", () => {
    const video = document.createElement("video");
    const play = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(video, "play", { configurable: true, value: play });
    video.currentTime = 3.8;

    playBackgroundVideo(video);

    // Should NOT rewind — playBackgroundVideo is called from media
    // events during normal playback, rewinding would stutter.
    expect(video.currentTime).toBe(3.8);
    expect(play).toHaveBeenCalledOnce();
  });

  it("recovers from stalls and pauses", () => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    const video = document.createElement("video");
    const onPlay = vi.fn();
    video.currentTime = 3.8;

    const cleanup = installBackgroundVideoRecovery(video, onPlay);
    video.dispatchEvent(new Event("stalled"));
    video.dispatchEvent(new Event("pause"));

    expect(onPlay).toHaveBeenCalledTimes(2);

    cleanup();
    video.dispatchEvent(new Event("stalled"));
    expect(onPlay).toHaveBeenCalledTimes(2);
  });

  describe("health check", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("does not restart a paused video when the document is hidden", () => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      const video = document.createElement("video");
      const onPlay = vi.fn();
      Object.defineProperty(video, "paused", {
        configurable: true,
        value: true,
      });
      Object.defineProperty(video, "readyState", {
        configurable: true,
        value: HTMLMediaElement.HAVE_CURRENT_DATA,
      });

      const cleanup = installBackgroundVideoRecovery(video, onPlay);
      vi.advanceTimersByTime(250);

      expect(onPlay).not.toHaveBeenCalled();
      cleanup();
    });

    it("does not restart a video that is still playing", () => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      const video = document.createElement("video");
      const onPlay = vi.fn();
      let playhead = 0.5;
      Object.defineProperty(video, "paused", {
        configurable: true,
        value: false,
      });
      Object.defineProperty(video, "currentTime", {
        configurable: true,
        get: () => playhead,
        set: (value: number) => {
          playhead = value;
        },
      });
      Object.defineProperty(video, "readyState", {
        configurable: true,
        value: HTMLMediaElement.HAVE_CURRENT_DATA,
      });

      const cleanup = installBackgroundVideoRecovery(video, onPlay);
      vi.advanceTimersByTime(250);
      playhead += 0.2;
      vi.advanceTimersByTime(250);

      expect(onPlay).not.toHaveBeenCalled();
      cleanup();
    });

    it("rewinds and restarts a video stuck at the loop boundary", () => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      const video = document.createElement("video");
      const onPlay = vi.fn();
      let playhead = 9.975;
      Object.defineProperty(video, "paused", {
        configurable: true,
        value: false,
      });
      Object.defineProperty(video, "duration", {
        configurable: true,
        value: 10,
      });
      Object.defineProperty(video, "currentTime", {
        configurable: true,
        get: () => playhead,
        set: (value: number) => {
          playhead = value;
        },
      });
      Object.defineProperty(video, "readyState", {
        configurable: true,
        value: HTMLMediaElement.HAVE_CURRENT_DATA,
      });

      const cleanup = installBackgroundVideoRecovery(video, onPlay);
      vi.advanceTimersByTime(500);

      expect(playhead).toBe(0);
      expect(onPlay).toHaveBeenCalled();
      cleanup();
    });

    it("stops the health check interval when cleaned up", () => {
      const clearSpy = vi.spyOn(window, "clearInterval");
      const video = document.createElement("video");
      const onPlay = vi.fn();

      const cleanup = installBackgroundVideoRecovery(video, onPlay);
      cleanup();

      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
