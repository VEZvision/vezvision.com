import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CodeInjector from "./CodeInjector";
import type { fetchCodeInjection } from "@/services/codeInjection";

const fetchCodeInjectionMock = vi.fn();

type FetchCodeInjection = typeof fetchCodeInjection;

vi.mock("@/services/codeInjection", () => ({
  fetchCodeInjection: (): ReturnType<FetchCodeInjection> =>
    fetchCodeInjectionMock() as ReturnType<FetchCodeInjection>,
}));

vi.mock("@/lib/scheduleAfterWindowLoad", () => ({
  scheduleAfterWindowLoad: (work: () => void) => {
    work();
    return () => {};
  },
}));

describe("CodeInjector", () => {
  afterEach(() => {
    document.head
      .querySelectorAll(
        'meta[name="cms-test"], script, style, [data-vez-cms-head]',
      )
      .forEach((node) => node.remove());
    document.body
      .querySelectorAll("[data-cms-test], [data-vez-cms-body], script")
      .forEach((node) => node.remove());
    fetchCodeInjectionMock.mockReset();
  });

  it("injects fetched head markup on mount", async () => {
    fetchCodeInjectionMock.mockResolvedValue({
      head: '<meta name="cms-test" content="v1">',
      body: "",
    });

    render(<CodeInjector delayMs={0} />);

    await waitFor(() => {
      expect(
        document.head
          .querySelector('meta[name="cms-test"]')
          ?.getAttribute("content"),
      ).toBe("v1");
    });
    expect(
      document.head.querySelectorAll('meta[name="cms-test"]'),
    ).toHaveLength(1);
  });

  it("injects safe head metadata and strips executable tags", async () => {
    fetchCodeInjectionMock.mockResolvedValue({
      head: '<meta name="cms-test" content="ok"><script src="https://evil.example/x.js"></script><style>body{display:none}</style>',
      body: "",
    });

    render(<CodeInjector delayMs={0} />);

    await waitFor(() => {
      expect(
        document.head
          .querySelector('meta[name="cms-test"]')
          ?.getAttribute("content"),
      ).toBe("ok");
    });
    expect(document.head.querySelector("script")).toBeNull();
    expect(document.head.querySelector("style")).toBeNull();
  });

  it("strips seo-critical link rels from cms head", async () => {
    fetchCodeInjectionMock.mockResolvedValue({
      head: '<link rel="canonical" href="https://evil.example/hijack"><link rel="alternate" hreflang="en" href="https://evil.example/en"><link rel="icon" href="https://vezvision.com/favicon.svg">',
      body: "",
    });

    render(<CodeInjector delayMs={0} />);

    await waitFor(() => {
      expect(document.head.querySelector('link[rel="icon"]')).not.toBeNull();
    });
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('link[rel="alternate"]')).toBeNull();
  });

  it("injects sanitized body markup without scripts", async () => {
    fetchCodeInjectionMock.mockResolvedValue({
      head: "",
      body: '<div class="cms-body-slot">Hello</div><script>window.__xss = true</script>',
    });

    render(<CodeInjector delayMs={0} />);

    await waitFor(() => {
      expect(
        document.body.querySelector("[data-vez-cms-body]"),
      ).toHaveTextContent("Hello");
    });
    expect(document.body.querySelector("script")).toBeNull();
  });
});
