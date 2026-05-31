import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { logError } from '@/lib/logger';
import {
    getSettings,
    saveSettings as saveSettingsService,
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
    saveSettings: (key: string, value: unknown, isPublic?: boolean) => Promise<void>;
    refreshSettings: () => Promise<void>;
}

const defaultState: SettingsState = {
    identity: null, contact: null, social: null,
    seo: null, code: null, maintenance: null, seo_files: null, company: null, navigation: null, footer: null, pageSeo: {}, pageSections: {},
};

const SettingsContext = createContext<SettingsContextType>({
    ...defaultState,
    settings: defaultState,
    loading: true,
    error: null,
    saveSettings: async () => {},
    refreshSettings: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<SettingsState>(defaultState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);

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

        setSettings({
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
        });
        setError(errors[0] ?? null);
        setLoading(false);
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    useEffect(() => {
        const channel = supabase
            .channel('vezvision-public-settings-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_site_settings' }, () => {
                void fetchSettings();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_page_seo' }, () => {
                void fetchSettings();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vv_page_sections' }, () => {
                void fetchSettings();
            })
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [fetchSettings]);

    const save = useCallback(async (key: string, value: unknown, _isPublic?: boolean) => {
        void _isPublic
        await saveSettingsService(key, value);
        await fetchSettings();
    }, [fetchSettings]);

    const value = useMemo(() => ({
        ...settings,
        settings,
        loading,
        error,
        saveSettings: save,
        refreshSettings: fetchSettings,
    }), [settings, loading, error, save, fetchSettings]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettingsContext = () => useContext(SettingsContext);
