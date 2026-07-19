import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("PostgREST object responses", () => {
  it("replaces the default Accept header when requesting a single object", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.test");
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("accept")).toBe("application/vnd.pgrst.object+json");
      return Promise.resolve(
        new Response(JSON.stringify({ id: "project-1", title: "Project" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getApiClient } = await import("./api");
    const result = await getApiClient()
      .from<{ id: string; title: string }>("projects")
      .select("id,title")
      .eq("id", "project-1")
      .single();

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ id: "project-1", title: "Project" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("API client errors", () => {
  it("preserves a backend error message for function failures", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.vezvision.test");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: "Captcha verification is required" }),
            { status: 400, headers: { "content-type": "application/json" } },
          ),
        ),
    );

    const { getApiClient } = await import("./api");
    const result = await getApiClient().invoke("submit-contact", {});

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Captcha verification is required");
    expect(result.error?.status).toBe(400);
  });
});
