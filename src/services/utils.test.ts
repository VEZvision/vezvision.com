import { describe, expect, it } from "vitest";

import { isAbortLikeError } from "./utils";

describe("isAbortLikeError", () => {
  it("recognizes DOM abort errors", () => {
    const error = new DOMException("The user aborted a request.", "AbortError");

    expect(isAbortLikeError(error)).toBe(true);
  });

  it("recognizes Supabase abort errors returned as plain objects", () => {
    expect(
      isAbortLikeError({
        name: "AbortError",
        message: "AbortError: signal is aborted without reason",
      }),
    ).toBe(true);
    expect(
      isAbortLikeError({
        message: "AbortError: signal is aborted without reason",
      }),
    ).toBe(true);
  });

  it("rejects unrelated errors", () => {
    expect(isAbortLikeError(new Error("Something else failed"))).toBe(false);
    expect(isAbortLikeError({ message: "permission denied" })).toBe(false);
  });
});
