import type {
  ContactSettings,
  SocialSettings,
  SeoSettings,
  MaintenanceSettings,
  IdentitySettings,
  SeoFilesSettings,
  CompanySettings,
  NavigationSettings,
  FooterSettings,
} from "@/services/settings";
import type { PageSeoMap } from "@/services/pageSeo";
import type { PageSectionsMap } from "@/services/pageSections";

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

export interface SettingsContextType extends SettingsState {
  settings: SettingsState;
  loading: boolean;
  error: unknown;
  degraded: boolean;
  refreshSettings: () => Promise<void>;
}
