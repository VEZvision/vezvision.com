export type Language = "pl" | "en";

const LANGUAGE_STORAGE_KEY = "vezvision_language";

const localeCache = new Map<Language, Record<string, string>>();
const localePromises = new Map<Language, Promise<Record<string, string>>>();

async function importLocale(
  language: Language,
): Promise<Record<string, string>> {
  if (language === "pl") {
    const mod = await import("./pl");
    return mod.plTranslations as Record<string, string>;
  }

  const mod = await import("./en");
  return mod.enTranslations as Record<string, string>;
}

export function detectInitialLanguage(): Language {
  try {
    if (typeof window !== "undefined") {
      const firstSegment = window.location.pathname
        .split("/")
        .filter(Boolean)[0];
      if (firstSegment === "pl" || firstSegment === "en") {
        return firstSegment;
      }
    }

    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "pl" || stored === "en") return stored;
    const langs = (
      navigator.languages?.length ? navigator.languages : [navigator.language]
    ) as string[];
    const hasPL = langs.some(
      (lang) => typeof lang === "string" && lang.toLowerCase().startsWith("pl"),
    );
    return hasPL ? "pl" : "en";
  } catch {
    return "en";
  }
}

export function getCachedLocale(
  language: Language,
): Record<string, string> | undefined {
  return localeCache.get(language);
}

export function seedLocaleCache(
  language: Language,
  dict: Record<string, string>,
): void {
  localeCache.set(language, dict);
}

export async function ensureLocaleLoaded(
  language: Language,
): Promise<Record<string, string>> {
  const cached = localeCache.get(language);
  if (cached) return cached;

  const pending = localePromises.get(language);
  if (pending) return pending;

  const promise = importLocale(language).then((dict) => {
    localeCache.set(language, dict);
    localePromises.delete(language);
    return dict;
  });

  localePromises.set(language, promise);
  return promise;
}

export function prefetchLocale(language: Language): void {
  void ensureLocaleLoaded(language);
}
