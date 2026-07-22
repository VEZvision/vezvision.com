import { describe, expect, it } from "vitest";
import { stripHtmlToText } from "./html";

describe("stripHtmlToText", () => {
  it("decodes HTML entities exactly once", () => {
    expect(stripHtmlToText("<p>A&nbsp;&amp;&lt;&gt;&quot;&#39;</p>")).toBe(
      `A &<>"'`,
    );
    expect(stripHtmlToText("&amp;quot;")).toBe("&quot;");
  });

  it("normalizes whitespace after removing tags", () => {
    expect(stripHtmlToText("<p>Hello</p>\n\t<p>world</p>")).toBe("Hello world");
  });
});
