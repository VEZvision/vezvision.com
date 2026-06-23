import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LegalMarkdown from "./LegalMarkdown";

vi.mock("@/hooks/useLanguage", () => ({
  useLanguageContext: () => ({ language: "pl" as const }),
}));

describe("LegalMarkdown", () => {
  it("renders safe external links", async () => {
    render(<LegalMarkdown content="[Docs](https://example.com/docs)" />);
    await waitFor(() => {
      const link = screen.getByRole("link", { name: "Docs" });
      expect(link).toHaveAttribute("href", "https://example.com/docs");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("localizes internal links", async () => {
    render(<LegalMarkdown content="[Privacy](/privacy-policy)" />);
    await waitFor(() => {
      const link = screen.getByRole("link", { name: "Privacy" });
      expect(link).toHaveAttribute("href", "/pl/privacy-policy/");
    });
  });

  it("blocks javascript links", async () => {
    render(<LegalMarkdown content="[Click me](javascript:alert(1))" />);
    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "Click me" })).toBeNull();
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });
  });

  it("blocks data links", async () => {
    render(
      <LegalMarkdown content="[Payload](data:text/html,<script>alert(1)</script>)" />,
    );
    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "Payload" })).toBeNull();
    });
  });
});
