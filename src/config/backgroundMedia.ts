const BACKGROUND_MEDIA_VERSION = "20260722-1";

export function versionBackgroundMedia(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${BACKGROUND_MEDIA_VERSION}`;
}
