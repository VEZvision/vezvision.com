import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isStaleChunkError,
  tryRecoverFromStaleChunk,
} from "./chunkRecovery";

beforeEach(() => {
  window.sessionStorage.clear();
});

describe("chunk recovery", () => {
  it.each([
    "Failed to fetch dynamically imported module: /assets/Home-old.js",
    "Importing a module script failed.",
    "ChunkLoadError: Loading chunk 42 failed",
    "Unable to preload CSS for /assets/Home-old.css",
  ])("recognizes stale deployment assets: %s", (message) => {
    expect(isStaleChunkError(new Error(message))).toBe(true);
  });

  it("does not classify ordinary application errors as stale chunks", () => {
    expect(isStaleChunkError(new Error("API returned 500"))).toBe(false);
  });

  it("reloads once per route within the recovery window", () => {
    const reload = vi.fn();
    const error = new Error("Failed to fetch dynamically imported module");

    expect(tryRecoverFromStaleChunk(error, reload, 100_000)).toBe(true);
    expect(tryRecoverFromStaleChunk(error, reload, 100_500)).toBe(false);
    expect(reload).toHaveBeenCalledOnce();
  });
});
