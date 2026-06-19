import { logError } from "@/lib/logger";
import {
  readPublicSettingsCache,
  writePublicSettingsCache,
} from "@/lib/publicSettingsCache";
import {
  getSettings,
  normalizeSettingsEntries,
  SettingEntry,
} from "@/services/settings";
import { getAllPageSeo, PageSeoMap } from "@/services/pageSeo";
import {
  flattenCmsTranslations,
  normalizePageSections,
  PageSectionsMap,
  getPublicPageSections,
} from "@/services/pageSections";
import { setCmsTranslationsRegistry } from "@/services/cmsTranslationsRegistry";
import type { SettingsState } from "../SettingsContextDefinition";

export interface SettingsSnapshot extends SettingsState {
  error: unknown;
  degraded: boolean;
}

export const defaultState: SettingsState = {
  identity: null,
  contact: null,
  social: null,
  seo: null,
  maintenance: null,
  seo_files: null,
  company: null,
  navigation: null,
  footer: null,
  pageSeo: {},
  pageSections: {},
};

export const defaultSnapshot: SettingsSnapshot = {
  ...defaultState,
  error: null,
  degraded: false,
};

interface CoreSettingsSnapshot {
  settings: SettingsState;
  error: unknown;
}

function buildCoreSettings(entries: SettingEntry[]): SettingsState {
  const normalized = normalizeSettingsEntries(entries);
  return {
    identity: normalized.identity,
    contact: normalized.contact,
    social: normalized.social,
    seo: normalized.seo,
    maintenance: normalized.maintenance,
    seo_files: normalized.seo_files,
    company: normalized.company,
    navigation: normalized.navigation,
    footer: normalized.footer,
    pageSeo: {},
    pageSections: {},
  };
}

async function loadCoreSettingsSnapshot(): Promise<CoreSettingsSnapshot> {
  try {
    const { data } = await getSettings("ALL");
    return { settings: buildCoreSettings(data), error: null };
  } catch (reason) {
    logError("settingsContext.core", reason);
    return { settings: defaultState, error: reason };
  }
}

interface EnrichedSettingsSnapshot {
  pageSeo: PageSeoMap;
  pageSections: PageSectionsMap;
  degraded: boolean;
}

async function loadEnrichedSettingsSnapshot(): Promise<EnrichedSettingsSnapshot> {
  const [pageSeoResult, pageSectionsResult] = await Promise.allSettled([
    getAllPageSeo(),
    getPublicPageSections(),
  ]);

  const pageSeo: PageSeoMap =
    pageSeoResult.status === "fulfilled" ? pageSeoResult.value : {};
  const pageSectionsPayload =
    pageSectionsResult.status === "fulfilled"
      ? pageSectionsResult.value
      : { data: [], error: "Unknown page sections error" };

  if (pageSeoResult.status === "rejected") {
    logError("settingsContext.pageSeo", pageSeoResult.reason);
  }

  if (pageSectionsResult.status === "rejected") {
    logError("settingsContext.pageSections", pageSectionsResult.reason);
  } else if (pageSectionsPayload.error) {
    logError("settingsContext.pageSections", pageSectionsPayload.error);
  }

  const pageSections = normalizePageSections(pageSectionsPayload.data);
  setCmsTranslationsRegistry(flattenCmsTranslations(pageSections));

  const degraded =
    pageSeoResult.status === "rejected" ||
    pageSectionsResult.status === "rejected" ||
    Boolean(pageSectionsPayload.error);

  return { pageSeo, pageSections, degraded };
}

export async function loadSettingsSnapshot(): Promise<SettingsSnapshot> {
  const [core, enriched] = await Promise.all([
    loadCoreSettingsSnapshot(),
    loadEnrichedSettingsSnapshot(),
  ]);

  return {
    ...core.settings,
    pageSeo: enriched.pageSeo,
    pageSections: enriched.pageSections,
    error: core.error,
    degraded: enriched.degraded,
  };
}

export { readPublicSettingsCache, writePublicSettingsCache };
