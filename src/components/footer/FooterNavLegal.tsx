import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { Language } from "@/hooks/useLanguage";
import { getLocalizedLabel } from "@/utils/i18n";

interface NavItem {
  id: string;
  href: string;
  labelPl: string;
  labelEn: string;
  enabled: boolean;
}

interface FooterNavProps {
  navLinks: NavItem[];
  legalLinks: NavItem[];
  language: Language;
  onPrivacySettings: () => void;
  brandName: string;
  isExternal: (href: string) => boolean;
  linkClass: string;
  legalLinkClass: string;
}

export function FooterNavLegal({
  navLinks,
  legalLinks,
  language,
  onPrivacySettings,
  brandName,
  isExternal,
  linkClass,
  legalLinkClass,
}: FooterNavProps) {
  return (
    <nav>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-4">
        {navLinks.map((item) =>
          isExternal(item.href) ? (
            <a
              key={item.id}
              href={item.href}
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getLocalizedLabel(language, item.labelPl, item.labelEn)}
            </a>
          ) : (
            <Link key={item.id} to={item.href} className={linkClass}>
              {getLocalizedLabel(language, item.labelPl, item.labelEn)}
            </Link>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-600 mb-4">
        {legalLinks.map((item, index) => (
          <Fragment key={item.id}>
            {isExternal(item.href) ? (
              <a
                href={item.href}
                className={legalLinkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getLocalizedLabel(language, item.labelPl, item.labelEn)}
              </a>
            ) : (
              <Link to={item.href} className={legalLinkClass}>
                {getLocalizedLabel(language, item.labelPl, item.labelEn)}
              </Link>
            )}
            {index < legalLinks.length - 1 && <span>•</span>}
          </Fragment>
        ))}
        {legalLinks.length > 0 && <span>•</span>}
        <button
          type="button"
          onClick={onPrivacySettings}
          className={legalLinkClass}
        >
          {language === "en" ? "Privacy Settings" : "Ustawienia prywatności"}
        </button>
      </div>

      <div className="text-center text-sm text-gray-600">
        {brandName} © {new Date().getFullYear()}.
      </div>
    </nav>
  );
}
