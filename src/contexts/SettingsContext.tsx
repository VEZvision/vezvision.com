import { createContext, useContext, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { logError } from '@/lib/logger';
import {
    readPublicSettingsCache,
    writePublicSettingsCache,
} from '@/lib/publicSettingsCache';
import {
    getSettings,
    ContactSettings,
    SocialSettings,
    SeoSettings,
    MaintenanceSettings,
    IdentitySettings,
    SeoFilesSettings,
    CompanySettings,
    NavigationSettings,
    FooterSettings,
    normalizeSettingsEntries,
    SettingEntry,
} from '@/services/settings';
import { getAllPageSeo, PageSeoMap } from '@/services/pageSeo';
import { flattenCmsTranslations, normalizePageSections, PageSectionsMap, getPublicPageSections } from '@/services/pageSections';
import { setCmsTranslationsRegistry } from '@/services/cmsTranslationsRegistry';
import { getSupabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export interface SettingsState {
    identity: IdentitySettings | null;
    contact: ContactSettings | null;
    social: SocialSettings | null;
    seo: SeoSettings | null;
    maintenance: MaintenanceSettings | null;
    seo_files: SeoFilesSettings | null;
    company: CompanySettings | null;
    navigation: NavigationSettings | null;
    footer: FooterSettings | null;
    pageSeo: PageSeoMap;
    pageSections: PageSectionsMap;
}

interface EnrichedSettingsSnapshot extends Pick<SettingsState, 'pageSeo' | 'pageSections'> {
    degraded: boolean;
}

export interface SettingsContextType extends SettingsState {
    settings: SettingsState;
    /** True only until core CMS settings (nav, identity, maintenance) are available. */
    loading: boolean;
    error: unknown;
    /** True when core or enriched CMS data failed partially or fully. */
    degraded: boolean;
    refreshSettings: () => Promise<void>;
}

const defaultState: SettingsState = {
    identity: null, contact: null, social: null,
    seo: null, maintenance: null, seo_files: null, company: null, navigation: null, footer: null, pageSeo: {}, pageSections: {},
};

const SETTINGS_QUERY_KEY = ['public-settings'] as const;

interface CoreSettingsSnapshot {
    settings: SettingsState;
    error: unknown;
}

interface SettingsSnapshot extends SettingsState {
    error: unknown;
    degraded: boolean;
}

const defaultSnapshot: SettingsSnapshot = {
    ...defaultState,
    error: null,
    degraded: false,
};

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
        const { data } = await getSettings('ALL');
        return { settings: buildCoreSettings(data), error: null };
    } catch (reason) {
        logError('settingsContext.core', reason);
        return { settings: defaultState, error: reason };
    }
}

async function loadEnrichedSettingsSnapshot(): Promise<EnrichedSettingsSnapshot> {
    const [pageSeoResult, pageSectionsResult] = await Promise.allSettled([
        getAllPageSeo(),
        getPublicPageSections(),
    ]);

    const pageSeo: PageSeoMap = pageSeoResult.status === 'fulfilled' ? pageSeoResult.value : {};
    const pageSectionsPayload = pageSectionsResult.status === 'fulfilled'
        ? pageSectionsResult.value
        : { data: [], error: 'Unknown page sections error' };

    if (pageSeoResult.status === 'rejected') {
        logError('settingsContext.pageSeo', pageSeoResult.reason);
    }

    if (pageSectionsResult.status === 'rejected') {
        logError('settingsContext.pageSections', pageSectionsResult.reason);
    } else if (pageSectionsPayload.error) {
        logError('settingsContext.pageSections', pageSectionsPayload.error);
    }

    const pageSections = normalizePageSections(pageSectionsPayload.data);
    setCmsTranslationsRegistry(flattenCmsTranslations(pageSections));

    const degraded =
        pageSeoResult.status === 'rejected' ||
        pageSectionsResult.status === 'rejected' ||
        Boolean(pageSectionsPayload.error);

    return { pageSeo, pageSections, degraded };
}

async function loadSettingsSnapshot(): Promise<SettingsSnapshot> {
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

const SettingsContext = createContext<SettingsContextType>({
    ...defaultState,
    settings: defaultState,
    loading: true,
    error: null,
    degraded: false,
    refreshSettings: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const cachedSnapshot = readPublicSettingsCache();

    const query = useQuery({
        queryKey: SETTINGS_QUERY_KEY,
        queryFn: loadSettingsSnapshot,
        initialData: cachedSnapshot
            ? { ...cachedSnapshot.settings, error: null, degraded: false }
            : undefined,
        staleTime: 5 * 60 * 1000,
    });

    const snapshot = query.data ?? defaultSnapshot;
    const { error, degraded, ...settings } = snapshot;

    const loading = query.isLoading && !query.data;

    useEffect(() => {
        if (!query.data) return;
        const settingsToCache = Object.fromEntries(
            Object.entries(query.data).filter(([key]) => key !== 'error' && key !== 'degraded')
        ) as Omit<SettingsSnapshot, 'error' | 'degraded'>;
        writePublicSettingsCache(settingsToCache);
    }, [query.data]);

    const refreshSettings = useCallback(async () => {
        await query.refetch();
    }, [query]);

    useEffect(() => {
        let removed = false;
        let channel: ReturnType<SupabaseClient<Database>['channel']> | null = null;
        let supabaseClient: SupabaseClient<Database> | null = null;

        const subscribe = async () => {
            if (removed) return;
            supabaseClient = await getSupabase();
            if (removed) return;

            channel = supabaseClient
                .channel('vezvision-public-settings-sync')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_site_settings' }, () => {
                    void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_page_seo' }, () => {
                    void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_page_sections' }, () => {
                    void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
                })
                .subscribe();
        };

        if (typeof window.requestIdleCallback === 'function') {
            const idleId = window.requestIdleCallback(() => { void subscribe() }, { timeout: 5000 });
            return () => {
                removed = true;
                window.cancelIdleCallback(idleId);
                if (channel && supabaseClient) void supabaseClient.removeChannel(channel);
            };
        }

        void subscribe();
        return () => {
            removed = true;
            if (channel && supabaseClient) void supabaseClient.removeChannel(channel);
        };
    }, [queryClient]);

    const value = useMemo(() => ({
        ...settings,
        settings,
        loading,
        error,
        degraded,
        refreshSettings,
    }), [settings, loading, error, degraded, refreshSettings]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettingsContext = () => useContext(SettingsContext);
