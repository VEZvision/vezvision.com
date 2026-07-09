import { beforeEach, describe, expect, it, vi } from "vitest";

import { listActiveServicesContent } from "./servicesContent";

const fromMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(() => Promise.resolve({ from: fromMock })),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

type QueryResponse = {
  readonly data: readonly Record<string, unknown>[];
  readonly error: null;
};

class QueryMock {
  readonly select = vi.fn((columns: string) => {
    this.selectedColumns.push(columns);
    return this;
  });

  readonly eq = vi.fn(() => this);

  readonly order = vi.fn(() => this);

  readonly abortSignal = vi.fn(() => this);

  readonly limit = vi.fn(() => Promise.resolve(this.response));

  constructor(
    private readonly response: QueryResponse,
    private readonly selectedColumns: string[],
  ) {}
}

describe("listActiveServicesContent", () => {
  const serviceSelectColumns: string[] = [];

  beforeEach(() => {
    serviceSelectColumns.length = 0;
    fromMock.mockReset();
    fromMock.mockImplementation((table: string) => {
      if (table === "vv_services") {
        return new QueryMock(
          {
            data: [
              {
                id: "service-1",
                slug: "strategy",
                status: "active",
                featured: true,
                order_index: 1,
                icon: "sparkles",
                price: 1000,
                duration: "2 weeks",
                title_pl: "Strategia",
                title_en: "Strategy",
                description_pl: "Opis",
                description_en: "Description",
                short_desc_pl: "Krótko",
                short_desc_en: "Short",
                meta_title_pl: null,
                meta_title_en: null,
                meta_desc_pl: null,
                meta_desc_en: null,
                created_at: "2026-01-01T00:00:00.000Z",
                updated_at: "2026-01-01T00:00:00.000Z",
                vv_service_category_assignments: [],
              },
            ],
            error: null,
          },
          serviceSelectColumns,
        );
      }

      if (table === "vv_service_categories") {
        return new QueryMock({ data: [], error: null }, []);
      }

      throw new Error(`Unexpected Supabase table in test: ${table}`);
    });
  });

  it("does not select service feature columns dropped from the live schema", async () => {
    const result = await listActiveServicesContent(undefined, "pl");
    const selectedColumns = serviceSelectColumns.join("\n");

    expect(selectedColumns).not.toContain("features_pl");
    expect(selectedColumns).not.toContain("features_en");
    expect(result.services[0]?.translations[0]?.features).toEqual([]);
    expect(result.services[0]?.translations[1]?.features).toEqual([]);
  });
});
