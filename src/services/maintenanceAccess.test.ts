import { describe, expect, it, vi } from "vitest";

import {
  fetchMaintenanceAccess,
  fetchMaintenanceEnabledFromDb,
  isSiteAccessible,
} from "./maintenanceAccess";

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

const mockFrom = vi.fn();
vi.mock("@/lib/api", () => ({
  getApiClient: () => ({
    from: mockFrom,
    invoke: vi.fn(),
  }),
}));

function mockDbResponse(value: { enabled?: boolean } | null) {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: value ? { value } : null,
      error: null,
    }),
  });
}

describe("fetchMaintenanceEnabledFromDb", () => {
  it("returns true when maintenance is enabled in the database", async () => {
    mockDbResponse({ enabled: true });
    const result = await fetchMaintenanceEnabledFromDb();
    expect(result).toBe(true);
  });

  it("returns false when maintenance is disabled in the database", async () => {
    mockDbResponse({ enabled: false });
    const result = await fetchMaintenanceEnabledFromDb();
    expect(result).toBe(false);
  });

  it("returns null when no maintenance setting exists", async () => {
    mockDbResponse(null);
    const result = await fetchMaintenanceEnabledFromDb();
    expect(result).toBe(false);
  });
});

describe("fetchMaintenanceAccess", () => {
  it("returns accessible when maintenance is off", async () => {
    mockDbResponse({ enabled: false });
    const snapshot = await fetchMaintenanceAccess();
    expect(snapshot).toEqual({
      maintenance: false,
      bypass: true,
      unavailable: false,
    });
  });

  it("returns blocked when maintenance is on in the database", async () => {
    mockDbResponse({ enabled: true });
    const snapshot = await fetchMaintenanceAccess();
    expect(snapshot.maintenance).toBe(true);
    expect(snapshot.bypass).toBe(false);
    expect(snapshot.unavailable).toBe(false);
  });

  it("returns accessible when database is unreachable", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: new Error("connection refused"),
      }),
    });
    const snapshot = await fetchMaintenanceAccess();
    expect(snapshot).toEqual({
      maintenance: false,
      bypass: true,
      unavailable: false,
    });
  });
});

describe("isSiteAccessible", () => {
  const accessible = {
    maintenance: false,
    bypass: true,
    unavailable: false,
  };
  const blocked = {
    maintenance: true,
    bypass: false,
    unavailable: false,
  };
  const unavailable = {
    maintenance: false,
    bypass: true,
    unavailable: true,
  };

  it("allows access when maintenance is off", () => {
    expect(isSiteAccessible(accessible)).toBe(true);
  });

  it("blocks access when maintenance is on without bypass", () => {
    expect(isSiteAccessible(blocked)).toBe(false);
  });

  it("allows access when edge is unavailable and no maintenance flags are set", () => {
    expect(isSiteAccessible(unavailable, false, false)).toBe(true);
  });

  it("blocks access when edge is unavailable but CMS maintenance is enabled", () => {
    expect(isSiteAccessible(unavailable, true, null)).toBe(false);
  });

  it("blocks access when edge is unavailable and DB confirms maintenance", () => {
    expect(isSiteAccessible(unavailable, false, true)).toBe(false);
  });

  it("allows access when edge is unavailable, no CMS flag, and DB is not in maintenance", () => {
    expect(isSiteAccessible(unavailable, false, false)).toBe(true);
  });
});
