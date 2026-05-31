import { createContext, useContext, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { logError } from '@/lib/logger';
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

interface SettingsState {
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
    loading: boolean;
    error: unknown;
    refreshSettings: () => Promise<void>;
}

const defaultState: SettingsState = {
    identity: null, contact: null, social: null,
    seo: null, code: null, maintenance: null, seo_files: null, company: null, navigation: null, footer: null, pageSeo: {}, pageSections: {},
};

const PUBLIC_SETTINGS_QUERY_KEY = ['public-settings'] as const;

interface PublicSettingsSnapshot {
    settings: SettingsState;
    error: unknown;
}

async function loadPublicSettingsSnapshot(): Promise<PublicSettingsSnapshot> {
    const [settingsResult, pageSeoResult, pageSectionsResult] = await Promise.allSettled([
        getSettings('ALL'),
        getAllPageSeo(),
        getPublicPageSections(),
    ]);

    const settingsEntries: SettingEntry[] = settingsResult.status === 'fulfilled' ? settingsResult.value.data : [];
    const pageSeo: PageSeoMap = pageSeoResult.status === 'fulfilled' ? pageSeoResult.value : {};
    const pageSectionsPayload = pageSectionsResult.status === 'fulfilled' ? pageSectionsResult.value : { data: [], error: 'Unknown page sections error' };
    const errors: unknown[] = [];

    if (settingsResult.status === 'rejected') {
        errors.push(settingsResult.reason);
        logError('settingsContext.settings', settingsResult.reason);
    }

    if (pageSeoResult.status === 'rejected') {
        errors.push(pageSeoResult.reason);
        logError('settingsContext.pageSeo', pageSeoResult.reason);
    }

    if (pageSectionsResult.status === 'rejected') {
        errors.push(pageSectionsResult.reason);
        logError('settingsContext.pageSections', pageSectionsResult.reason);
    } else if (pageSectionsPayload.error) {
        errors.push(pageSectionsPayload.error);
        logError('settingsContext.pageSections', pageSectionsPayload.error);
    }

    const normalized = normalizeSettingsEntries(settingsEntries);
    const pageSections = normalizePageSections(pageSectionsPayload.data);
    setCmsTranslationsRegistry(flattenCmsTranslations(pageSections));

    return {
        settings: {
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
            pageSeo,
            pageSections,
        },
        error: errors[0] ?? null,
    };
}

const SettingsContext = createContext<SettingsContextType>({
    ...defaultState,
    settings: defaultState,
    loading: true,
    error: null,
    refreshSettings: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const settingsQuery = useQuery({
        queryKey: PUBLIC_SETTINGS_QUERY_KEY,
        queryFn: loadPublicSettingsSnapshot,
    });

    const settings = settingsQuery.data?.settings ?? defaultState;
    const loading = settingsQuery.isLoading;
    const error = settingsQuery.data?.error ?? settingsQuery.error ?? null;

    const refreshSettings = useCallback(async () => {
        await settingsQuery.refetch();
    }, [settingsQuery]);

    useEffect(() => {
        const channel = supabase
            .channel('vezvision-public-settings-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_site_settings' }, () => {
                void queryClient.invalidateQueries({ queryKey: PUBLIC_SETTINGS_QUERY_KEY });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_page_seo' }, () => {
                void queryClient.invalidateQueries({ queryKey: PUBLIC_SETTINGS_QUERY_KEY });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_page_sections' }, () => {
                void queryClient.invalidateQueries({ queryKey: PUBLIC_SETTINGS_QUERY_KEY });
            })
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const value = useMemo(() => ({
        ...settings,
        settings,
        loading,
        error,
        refreshSettings,
    }), [settings, loading, error, refreshSettings]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettingsContext = () => useContext(SettingsContext);
