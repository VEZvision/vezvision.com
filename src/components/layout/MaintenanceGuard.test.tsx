import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MaintenanceGuard } from "./MaintenanceGuard";
import { isSiteAccessible } from "@/services/maintenanceAccess";
import type { SettingsContextType } from "@/contexts/SettingsContext";

const useSettingsMock = vi.fn<() => Partial<SettingsContextType>>();
const fetchMaintenanceAccessMock = vi.fn();
const fetchMaintenanceEnabledFromDbMock = vi.fn();

vi.mock("@/hooks/useSettings", () => ({
  useSettings: () => useSettingsMock(),
}));

vi.mock("@/services/maintenanceAccess", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/services/maintenanceAccess")>();
  return {
    ...actual,
    fetchMaintenanceAccess: (...args: unknown[]) =>
      fetchMaintenanceAccessMock(...args) as ReturnType<
        typeof import("@/services/maintenanceAccess").fetchMaintenanceAccess
      >,
    fetchMaintenanceEnabledFromDb: (...args: unknown[]) =>
      fetchMaintenanceEnabledFromDbMock(...args) as ReturnType<
        typeof import("@/services/maintenanceAccess").fetchMaintenanceEnabledFromDb
      >,
  };
});

vi.mock("@/pages/MaintenancePage", () => ({
  default: () => <div>Maintenance page</div>,
}));

describe("MaintenanceGuard", () => {
  afterEach(() => {
    delete window.__VEZ_PRERENDER__;
    vi.clearAllMocks();
  });

  it("keeps prerendered SEO routes accessible without checking maintenance", () => {
    window.__VEZ_PRERENDER__ = true;
    useSettingsMock.mockReturnValue({
      maintenance: { enabled: true, message: "Maintenance", description: "" },
      loading: false,
    });

    render(
      <MaintenanceGuard>
        <div>SEO route content</div>
      </MaintenanceGuard>,
    );

    expect(screen.getByText("SEO route content")).toBeInTheDocument();
    expect(fetchMaintenanceAccessMock).not.toHaveBeenCalled();
    expect(fetchMaintenanceEnabledFromDbMock).not.toHaveBeenCalled();
  });

  it("renders children immediately while settings are loading (optimistic)", () => {
    useSettingsMock.mockReturnValue({
      maintenance: null,
      loading: true,
    });

    render(
      <MaintenanceGuard>
        <div>App content</div>
      </MaintenanceGuard>,
    );

    expect(screen.getByText("App content")).toBeInTheDocument();
  });

  it("allows access when settings loaded, maintenance is off, and edge confirms", async () => {
    useSettingsMock.mockReturnValue({
      maintenance: { enabled: false, message: "", description: "" },
      loading: false,
      error: null,
    });
    fetchMaintenanceAccessMock.mockResolvedValue({
      maintenance: false,
      bypass: true,
      unavailable: false,
    });

    render(
      <MaintenanceGuard>
        <div>App content</div>
      </MaintenanceGuard>,
    );

    await waitFor(() => {
      expect(screen.getByText("App content")).toBeInTheDocument();
    });
    expect(fetchMaintenanceAccessMock).toHaveBeenCalled();
  });

  it("blocks access when maintenance is on and bypass is false", async () => {
    useSettingsMock.mockReturnValue({
      maintenance: {
        enabled: true,
        message: "Maintenance",
        description: "We are down",
      },
      loading: false,
    });
    fetchMaintenanceAccessMock.mockResolvedValue({
      maintenance: true,
      bypass: false,
      unavailable: false,
    });

    render(
      <MaintenanceGuard>
        <div>App content</div>
      </MaintenanceGuard>,
    );

    await waitFor(() => {
      expect(screen.getByText("Maintenance page")).toBeInTheDocument();
    });
    expect(screen.queryByText("App content")).not.toBeInTheDocument();
  });

  it("blocks access when edge reports maintenance even if cached settings say off", async () => {
    useSettingsMock.mockReturnValue({
      maintenance: { enabled: false, message: "", description: "" },
      loading: false,
      error: null,
    });
    fetchMaintenanceAccessMock.mockResolvedValue({
      maintenance: true,
      bypass: false,
      unavailable: false,
    });

    render(
      <MaintenanceGuard>
        <div>App content</div>
      </MaintenanceGuard>,
    );

    await waitFor(() => {
      expect(screen.getByText("Maintenance page")).toBeInTheDocument();
    });
  });

  it("fails closed when settings failed to load and database confirms maintenance", async () => {
    useSettingsMock.mockReturnValue({
      maintenance: null,
      loading: false,
      error: new Error("settings unavailable"),
    });
    fetchMaintenanceAccessMock.mockResolvedValue({
      maintenance: false,
      bypass: true,
      unavailable: true,
    });
    fetchMaintenanceEnabledFromDbMock.mockResolvedValue(true);

    render(
      <MaintenanceGuard>
        <div>App content</div>
      </MaintenanceGuard>,
    );

    await waitFor(() => {
      expect(screen.getByText("Maintenance page")).toBeInTheDocument();
    });
    expect(fetchMaintenanceAccessMock).toHaveBeenCalled();
    expect(fetchMaintenanceEnabledFromDbMock).toHaveBeenCalled();
  });

  it("fails closed when edge is unavailable and cached settings show maintenance enabled", async () => {
    useSettingsMock.mockReturnValue({
      maintenance: {
        enabled: true,
        message: "Maintenance",
        description: "We are down",
      },
      loading: false,
    });
    fetchMaintenanceAccessMock.mockResolvedValue({
      maintenance: false,
      bypass: true,
      unavailable: true,
    });
    fetchMaintenanceEnabledFromDbMock.mockResolvedValue(null);

    render(
      <MaintenanceGuard>
        <div>App content</div>
      </MaintenanceGuard>,
    );

    await waitFor(() => {
      expect(screen.getByText("Maintenance page")).toBeInTheDocument();
    });
  });
});

describe("isSiteAccessible", () => {
  it("fails closed when edge is unavailable, db read failed, and settings show maintenance", () => {
    expect(
      isSiteAccessible(
        { maintenance: false, bypass: true, unavailable: true },
        true,
        null,
      ),
    ).toBe(false);
  });

  it("allows access when edge is unavailable and maintenance is off everywhere", () => {
    expect(
      isSiteAccessible(
        { maintenance: false, bypass: true, unavailable: true },
        false,
        false,
      ),
    ).toBe(true);
  });
});
