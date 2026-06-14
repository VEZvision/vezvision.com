import { Link } from 'react-router-dom'
import { isSafeExternalHref } from '@/utils/safeHref'
import { getLocalizedLabel } from '@/utils/i18n'
import type { Language } from '@/hooks/useLanguage'

export interface NavLink {
  id: string
  href: string
  labelPl: string
  labelEn: string
  enabled: boolean
}

interface NavbarLinksProps {
  links: { id: string; href: string; labelPl: string; labelEn: string }[]
  language: Language
  onLinkClick?: () => void
  variant?: 'desktop' | 'mobile'
  contactButton?: { label: string; href: string; language: Language } | null
  onLanguageToggle?: () => void
}

export function NavbarLinks({
  links,
  language,
  onLinkClick,
  variant = 'desktop',
  contactButton,
  onLanguageToggle,
}: NavbarLinksProps) {
  const isExternal = (href: string) => isSafeExternalHref(href)
  const linkClass =
    variant === 'desktop'
      ? 'px-4 py-2 text-sm text-black hover:bg-black/[0.05] rounded-md transition-colors'
      : 'block px-3 py-2 text-base text-black hover:bg-white/50 rounded-md transition-colors'

  return (
    <>
      {links.map((item) =>
        isExternal(item.href) ? (
          <a
            key={item.id}
            href={item.href}
            onClick={onLinkClick}
            className={linkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            {getLocalizedLabel(language, item.labelPl, item.labelEn)}
          </a>
        ) : (
          <Link
            key={item.id}
            to={item.href}
            onClick={onLinkClick}
            className={linkClass}
          >
            {getLocalizedLabel(language, item.labelPl, item.labelEn)}
          </Link>
        ),
      )}
      {contactButton && (
        <div className={variant === 'mobile' ? 'pt-2' : ''}>
          {isExternal(contactButton.href) ? (
            <a
              href={contactButton.href}
              onClick={onLinkClick}
              className={
                variant === 'desktop'
                  ? 'inline-flex items-center px-5 py-2 bg-black text-white text-sm font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-colors'
                  : 'w-full text-left block px-3 py-2 bg-black text-white text-base font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-colors'
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {contactButton.label}
            </a>
          ) : (
            <Link
              to={contactButton.href}
              onClick={onLinkClick}
              className={
                variant === 'desktop'
                  ? 'inline-flex items-center px-5 py-2 bg-black text-white text-sm font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-colors'
                  : 'w-full text-left block px-3 py-2 bg-black text-white text-base font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-colors'
              }
            >
              {contactButton.label}
            </Link>
          )}
        </div>
      )}
      {onLanguageToggle && variant === 'mobile' && (
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={onLanguageToggle}
            data-testid="language-toggle-mobile"
            className="px-3 py-1 text-sm rounded-md transition-colors text-black hover:bg-white/50"
            aria-label={language === 'en' ? 'Switch to Polish' : 'Switch to English'}
          >
            {language.toUpperCase()}
          </button>
        </div>
      )}
    </>
  )
}
