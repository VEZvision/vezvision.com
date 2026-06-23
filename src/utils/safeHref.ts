export function isSafeHref(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return isSafeInternalHref(trimmed);
}

export function safeCmsHref(value: unknown, fallback: string): string {
  return isSafeHref(value) ? value.trim() : fallback;
}

export function isSafeInternalHref(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("#")) return trimmed.length > 1;
  return trimmed.startsWith("/") && !trimmed.startsWith("//");
}

export function isSafeExternalHref(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("mailto:")) {
    return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed);
  }

  if (trimmed.startsWith("tel:")) {
    return /^tel:\+?[0-9()\s-]{5,30}$/i.test(trimmed);
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafePublicHref(value: unknown): value is string {
  return isSafeInternalHref(value) || isSafeExternalHref(value);
}

export function safePublicHref(value: unknown, fallback = ""): string {
  return isSafePublicHref(value) ? value.trim() : fallback;
}

export function safeExternalHref(value: unknown, fallback = ""): string {
  return isSafeExternalHref(value) ? value.trim() : fallback;
}

export function safeAbsoluteHttpUrl(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : fallback;
  } catch {
    return fallback;
  }
}

export function joinUrlPath(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.trim();

  if (!cleanBase) {
    return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  }

  if (!cleanPath || cleanPath === "/") {
    return cleanBase;
  }

  return `${cleanBase}/${cleanPath.replace(/^\/+/, "")}`;
}

function isSafeAbsoluteHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeImageUrl(value: unknown, fallback = ""): string {
  if (isSafeInternalHref(value)) return value.trim();
  if (isSafeAbsoluteHttpsUrl(value)) return value.trim();
  return fallback;
}
