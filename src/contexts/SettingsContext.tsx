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
    CodeInjectionSettings,
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
import { supabase } from '@/lib/supabase';

export interface SettingsState {
    identity: IdentitySettings | null;
    contact: ContactSettings | null;
    social: SocialSettings | null;
    seo: SeoSettings | null;
    code: CodeInjectionSettings | null;
    maintenance: MaintenanceSettings | null;
    seo_files: SeoFilesSettings | null;
    company: CompanySettings | null;
    navigation: NavigationSettings | null;
    footer: FooterSettings | null;
    pageSeo: PageSeoMap;
    pageSections: PageSectionsMap;
}

interface SettingsContextType extends SettingsState {
    settings: SettingsState;
    /** True only until core CMS settings (nav, identity, maintenance) are available. */
    loading: boolean;
    /** Page SEO / sections still fetching (home can use fallbacks). */
    enriching: boolean;
    error: unknown;
    refreshSettings: () => Promise<void>;
}

const defaultState: SettingsState = {
    identity: null, contact: null, social: null,
    seo: null, code: null, maintenance: null, seo_files: null, company: null, navigation: null, footer: null, pageSeo: {}, pageSections: {},
};

const CORE_SETTINGS_QUERY_KEY = ['public-settings', 'core'] as const;
const ENRICHED_SETTINGS_QUERY_KEY = ['public-settings', 'enriched'] as const;

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
        code: normalized.code,
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

async function loadEnrichedSettingsSnapshot(): Promise<Pick<SettingsState, 'pageSeo' | 'pageSections'>> {
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

    return { pageSeo, pageSections };
}

const SettingsContext = createContext<SettingsContextType>({
    ...defaultState,
    settings: defaultState,
    loading: true,
    enriching: true,
    error: null,
    refreshSettings: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const cachedSnapshot = readPublicSettingsCache();

    const coreQuery = useQuery({
        queryKey: CORE_SETTINGS_QUERY_KEY,
        queryFn: loadCoreSettingsSnapshot,
        initialData: cachedSnapshot
            ? { settings: { ...cachedSnapshot.settings, pageSeo: {}, pageSections: {} }, error: null }
            : undefined,
        staleTime: 5 * 60 * 1000,
    });

    const enrichedQuery = useQuery({
        queryKey: ENRICHED_SETTINGS_QUERY_KEY,
        queryFn: loadEnrichedSettingsSnapshot,
        initialData: cachedSnapshot
            ? { pageSeo: cachedSnapshot.settings.pageSeo, pageSections: cachedSnapshot.settings.pageSections }
            : undefined,
        staleTime: 5 * 60 * 1000,
    });

    const settings = useMemo<SettingsState>(() => {
        const core = coreQuery.data?.settings ?? defaultState;
        const enriched = enrichedQuery.data;
        return {
            ...core,
            pageSeo: enriched?.pageSeo ?? core.pageSeo,
            pageSections: enriched?.pageSections ?? core.pageSections,
        };
    }, [coreQuery.data, enrichedQuery.data]);

    const loading = !coreQuery.data && coreQuery.isLoading;
    const enriching = !enrichedQuery.data && enrichedQuery.isFetching;
    const error = coreQuery.data?.error ?? coreQuery.error ?? null;

    useEffect(() => {
        if (!coreQuery.data?.settings || !enrichedQuery.data) return;
        writePublicSettingsCache({
            ...coreQuery.data.settings,
            pageSeo: enrichedQuery.data.pageSeo,
            pageSections: enrichedQuery.data.pageSections,
        });
    }, [coreQuery.data, enrichedQuery.data]);

    const refreshSettings = useCallback(async () => {
        await Promise.all([coreQuery.refetch(), enrichedQuery.refetch()]);
    }, [coreQuery, enrichedQuery]);

    useEffect(() => {
        let removed = false;
        let channel: ReturnType<typeof supabase.channel> | null = null;

        const subscribe = () => {
            if (removed) return;
            channel = supabase
                .channel('vezvision-public-settings-sync')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_site_settings' }, () => {
                    void queryClient.invalidateQueries({ queryKey: CORE_SETTINGS_QUERY_KEY });
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_page_seo' }, () => {
                    void queryClient.invalidateQueries({ queryKey: ENRICHED_SETTINGS_QUERY_KEY });
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_page_sections' }, () => {
                    void queryClient.invalidateQueries({ queryKey: ENRICHED_SETTINGS_QUERY_KEY });
                })
                .subscribe();
        };

        if (typeof window.requestIdleCallback === 'function') {
            const idleId = window.requestIdleCallback(subscribe, { timeout: 5000 });
            return () => {
                removed = true;
                window.cancelIdleCallback(idleId);
                if (channel) void supabase.removeChannel(channel);
            };
        }

        subscribe();
        return () => {
            removed = true;
            if (channel) void supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const value = useMemo(() => ({
        ...settings,
        settings,
        loading,
        enriching,
        error,
        refreshSettings,
    }), [settings, loading, enriching, error, refreshSettings]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettingsContext = () => useContext(SettingsContext);
