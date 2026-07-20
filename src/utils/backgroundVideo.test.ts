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

  it("restarts an ended video before playing it", () => {
    const video = document.createElement("video");
    const play = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(video, "ended", { configurable: true, value: true });
    Object.defineProperty(video, "play", { configurable: true, value: play });
    video.currentTime = 3.8;

    playBackgroundVideo(video);

    expect(video.currentTime).toBe(0);
    expect(play).toHaveBeenCalledOnce();
  });

  it("recovers explicitly when the media ends or stalls", () => {
    const video = document.createElement("video");
    const onPlay = vi.fn();
    video.currentTime = 3.8;

    const cleanup = installBackgroundVideoRecovery(video, onPlay);
    video.dispatchEvent(new Event("ended"));
    video.dispatchEvent(new Event("stalled"));

    expect(video.currentTime).toBe(0);
    expect(onPlay).toHaveBeenCalledTimes(2);

    cleanup();
    video.dispatchEvent(new Event("ended"));
    expect(onPlay).toHaveBeenCalledTimes(2);
  });

  describe("health check", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("restarts a paused video with data ready when the document is visible", () => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
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

      installBackgroundVideoRecovery(video, onPlay);
      vi.advanceTimersByTime(2000);

      expect(onPlay).toHaveBeenCalled();
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

      installBackgroundVideoRecovery(video, onPlay);
      vi.advanceTimersByTime(2000);

      expect(onPlay).not.toHaveBeenCalled();
    });

    it("does not restart a video that is still playing", () => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      const video = document.createElement("video");
      const onPlay = vi.fn();
      Object.defineProperty(video, "paused", {
        configurable: true,
        value: false,
      });
      Object.defineProperty(video, "readyState", {
        configurable: true,
        value: HTMLMediaElement.HAVE_CURRENT_DATA,
      });

      installBackgroundVideoRecovery(video, onPlay);
      vi.advanceTimersByTime(2000);

      expect(onPlay).not.toHaveBeenCalled();
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
