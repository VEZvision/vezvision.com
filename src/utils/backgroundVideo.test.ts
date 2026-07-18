import { describe, expect, it, vi } from "vitest";

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
});
