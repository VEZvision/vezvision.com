import { describe, it, expect } from "vitest";
import { safeJsonLd } from "@/utils/safeJsonLd";

describe("safeJsonLd", () => {
  it("stringifies objects", () => {
    expect(safeJsonLd({ "@type": "Organization", name: "Test" })).toBe(
      '{"@type":"Organization","name":"Test"}',
    );
  });

  it("escapes HTML characters", () => {
    const result = safeJsonLd({ name: '<script>alert("xss")</script>' });
    expect(result).not.toContain("<script>");
    expect(result).toContain("\\u003cscript\\u003e");
  });

  it("escapes & characters", () => {
    const result = safeJsonLd({ name: "AT&T" });
    expect(result).not.toContain("&");
    expect(result).toContain("\\u0026");
  });

  it("handles nested objects", () => {
    expect(() =>
      safeJsonLd({
        "@context": "https://schema.org",
        "@graph": [{ "@type": "Service", name: "Test" }],
      }),
    ).not.toThrow();
  });

  it("removes line/paragraph separators (JSON injection vectors)", () => {
    const result = safeJsonLd({ text: "hello\u2028world\u2029test" });
    expect(result).not.toContain("\u2028");
    expect(result).not.toContain("\u2029");
    expect(result).toContain("\\u2028");
    expect(result).toContain("\\u2029");
  });
});
