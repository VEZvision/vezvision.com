import type {
  CookieCategory,
  CookieInfo,
  CookiePreferences,
} from "../types/cookies";
import {
  COOKIE_DEFINITIONS,
  getCookieDefinition,
} from "../data/cookieDefinitions";

const CATEGORY_PATTERNS: Record<CookieCategory, RegExp[]> = {
  necessary: [/^vezvision_/, /^sb-/],
  functional: [],
  analytics: [/^sentry_/, /^_sentry/],
  marketing: [/_fbp$/, /^_ga/, /^_gid/, /^_gat/],
};

export function isCategoryAllowed(
  category: CookieCategory,
  preferences: CookiePreferences,
): boolean {
  if (category === "necessary") return true;
  return preferences[category] === true;
}

function deleteCookie(name: string): void {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch {
    /* cookie delete failed — non-critical */
  }
}

export function clearCookiesByCategory(category: CookieCategory): void {
  try {
    const definedCookies = COOKIE_DEFINITIONS.filter(
      (def) => def.category === category,
    ).map((def) => def.name);

    definedCookies.forEach((name) => deleteCookie(name));

    const patterns = CATEGORY_PATTERNS[category] || [];
    if (patterns.length > 0) {
      const allCookies = document.cookie.split(";");
      for (const cookie of allCookies) {
        const name = cookie.trim().split("=")[0];
        if (name && patterns.some((pattern) => pattern.test(name))) {
          deleteCookie(name);
        }
      }
    }
  } catch {
    /* cookie cleanup failed — non-critical */
  }
}

export function getAllCookies(): CookieInfo[] {
  try {
    const cookies: CookieInfo[] = [];
    const cookieStrings = document.cookie.split(";");

    for (const cookieString of cookieStrings) {
      const [name, value] = cookieString.trim().split("=");
      if (name && value) {
        const definition = getCookieDefinition(name);

        cookies.push({
          name: name.trim(),
          value: decodeURIComponent(value),
          category: definition?.category || "necessary",
          purpose: definition?.purpose || "Unknown purpose",
          expiry: definition?.expiry || "Unknown",
          domain: definition?.domain || window.location.hostname,
          provider: definition?.provider || "Unknown",
          isFirstParty: definition?.isFirstParty ?? true,
        });
      }
    }

    return cookies;
  } catch {
    return [];
  }
}
