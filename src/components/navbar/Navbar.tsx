import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoNavbar from "@/assets/logo-navbar.svg";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { isSafeExternalHref, safePublicHref } from "@/utils/safeHref";
import {
  switchLocalePath,
  localizeInternalHref,
  localizedPath,
} from "@/routing/locale";
import { getLocalizedLabel } from "@/utils/i18n";

function isExternalHref(href: string) {
  return isSafeExternalHref(href);
}

const FALLBACK_NAV_LINKS = [
  { id: "about", href: "/about", labelKey: "nav.about" },
  { id: "services", href: "/services", labelKey: "nav.services" },
  { id: "portfolio", href: "/portfolio", labelKey: "nav.portfolio" },
  { id: "blog", href: "/blog", labelKey: "nav.blog" },
  { id: "products", href: "/products", labelKey: "nav.products" },
] as const;

const Navbar = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguageContext();
  const { navigation } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = useCallback(() => {
    const nextLanguage = language === "en" ? "pl" : "en";
    setLanguage(nextLanguage);
    void navigate(
      `${switchLocalePath(location.pathname, nextLanguage)}${location.search}${location.hash}`,
      { replace: true },
    );
  }, [
    language,
    setLanguage,
    navigate,
    location.pathname,
    location.search,
    location.hash,
  ]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { rootMargin: "-48px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest("nav")) {
          setIsMenuOpen(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMenuOpen]);

  const navLinks = (
    navigation?.items?.length
      ? navigation.items.filter((item) => item.enabled)
      : FALLBACK_NAV_LINKS.map((item) => ({
          id: item.id,
          href: item.href,
          labelPl: t(item.labelKey),
          labelEn: t(item.labelKey),
          enabled: true,
        }))
  )
    .map((item) => ({
      ...item,
      href: localizeInternalHref(safePublicHref(item.href) || "", language),
    }))
    .filter((item) => item.href);
  const contactButtonLabel = navigation
    ? getLocalizedLabel(
        language,
        navigation.contactButtonLabelPl,
        navigation.contactButtonLabelEn,
      )
    : t("nav.contact");
  const contactButtonHref =
    localizeInternalHref(
      safePublicHref(navigation?.contactButtonHref, "/contact") || "/contact",
      language,
    ) || localizedPath(language, "contact");
  const navTextClass = "text-black";
  const navHoverClass = "hover:bg-black/[0.05]";
  const scrolledSurfaceClass =
    "border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-xl";
  const desktopGroupClass = isScrolled
    ? `bg-white ${scrolledSurfaceClass}`
    : "";
  const mobileButtonTextClass = "text-black";

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "48px",
          left: 0,
          height: "1px",
          width: "1px",
          pointerEvents: "none",
        }}
      />
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 [transform:translateZ(0)] ${
          isScrolled ? "pt-2" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 tablet:px-8 lg:px-8">
          <div
            className={`flex items-center justify-between h-16 tablet:h-18 lg:h-18 transition-all duration-500 ${
              isScrolled ? "" : "border-b border-transparent"
            }`}
          >
            {/* Left: Logo */}
            <div
              className={`transition-all duration-500 ${
                isScrolled ? `bg-white ${scrolledSurfaceClass} px-4` : ""
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 py-3">
                  <Link
                    to={localizedPath(language)}
                    className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  >
                    <img
                      src={logoNavbar}
                      alt="VezVision Logo"
                      className="h-6 w-auto"
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Center: Desktop Navigation */}
            <div
              className={`hidden tablet-lg:flex items-center justify-center transition-all duration-500 ${desktopGroupClass} ${isScrolled ? "px-2" : ""}`}
            >
              <div
                className={`flex items-center space-x-2 ${isScrolled ? "py-1" : ""}`}
              >
                {navLinks.map((item) =>
                  isExternalHref(item.href) ? (
                    <a
                      key={item.id}
                      href={item.href}
                      className={`px-4 py-2 text-sm ${navTextClass} ${navHoverClass} rounded-md transition-colors`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getLocalizedLabel(language, item.labelPl, item.labelEn)}
                    </a>
                  ) : (
                    <Link
                      key={item.id}
                      to={item.href}
                      prefetch="intent"
                      className={`px-4 py-2 text-sm ${navTextClass} ${navHoverClass} rounded-md transition-colors`}
                    >
                      {getLocalizedLabel(language, item.labelPl, item.labelEn)}
                    </Link>
                  ),
                )}
              </div>
            </div>

            {/* Right: Language, Contact & Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              {/* Desktop Language Toggle */}
              <div
                className={`hidden tablet-lg:flex items-center transition-all duration-500 ${desktopGroupClass} ${isScrolled ? "px-2 py-2" : ""}`}
              >
                <button
                  onClick={toggleLanguage}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${navTextClass} ${navHoverClass}`}
                  aria-label={
                    language === "en" ? "Switch to Polish" : "Switch to English"
                  }
                  data-testid="language-toggle-desktop"
                >
                  {language.toUpperCase()}
                </button>
              </div>

              {/* Desktop Contact Button */}
              <div
                className={`hidden tablet-lg:flex items-center transition-all duration-500 ${desktopGroupClass} ${isScrolled ? "px-3 py-2" : ""}`}
              >
                {isExternalHref(contactButtonHref) ? (
                  <a
                    href={contactButtonHref}
                    className="inline-flex items-center px-5 py-2 bg-black text-white text-sm font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contactButtonLabel}
                  </a>
                ) : (
                  <Link
                    to={contactButtonHref}
                    className="inline-flex items-center px-5 py-2 bg-black text-white text-sm font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
                  >
                    {contactButtonLabel}
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div
                className={`tablet-lg:hidden flex items-center transition-all duration-500 ${isScrolled ? "bg-white border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-xl" : ""}`}
              >
                <button
                  onClick={toggleMenu}
                  className={`inline-flex items-center justify-center p-2 rounded-md ${mobileButtonTextClass} transition-colors`}
                  aria-label={
                    isMenuOpen ? t("nav.menu.close") : t("nav.menu.open")
                  }
                  data-testid="mobile-menu-toggle"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6 pointer-events-none" />
                  ) : (
                    <Menu className="h-6 w-6 pointer-events-none" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`tablet-lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
              isMenuOpen ? "max-h-screen" : "max-h-0"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 rounded-lg mt-2">
              {navLinks.map((item) =>
                isExternalHref(item.href) ? (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base text-black hover:bg-white/50 rounded-md transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getLocalizedLabel(language, item.labelPl, item.labelEn)}
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base text-black hover:bg-white/50 rounded-md transition-colors"
                  >
                    {getLocalizedLabel(language, item.labelPl, item.labelEn)}
                  </Link>
                ),
              )}
              <div className="pt-2">
                {isExternalHref(contactButtonHref) ? (
                  <a
                    href={contactButtonHref}
                    onClick={closeMenu}
                    className="w-full text-left block px-3 py-2 bg-black text-white text-base font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contactButtonLabel}
                  </a>
                ) : (
                  <Link
                    to={contactButtonHref}
                    onClick={closeMenu}
                    className="w-full text-left block px-3 py-2 bg-black text-white text-base font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
                  >
                    {contactButtonLabel}
                  </Link>
                )}
              </div>
              {/* Mobile Language Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={toggleLanguage}
                  className={`px-3 py-1 text-sm rounded-md transition-colors text-black hover:bg-white/50`}
                  aria-label={
                    language === "en" ? "Switch to Polish" : "Switch to English"
                  }
                  data-testid="language-toggle-mobile"
                >
                  {language.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
