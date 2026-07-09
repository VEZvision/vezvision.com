const readStringProperty = (
  value: unknown,
  property: string,
): string | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, property);
  return typeof descriptor?.value === "string" ? descriptor.value : undefined;
};

export const isAbortLikeError = (error: unknown): boolean => {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (readStringProperty(error, "name") === "AbortError") return true;
  const rawMessage =
    error instanceof Error
      ? error.message
      : readStringProperty(error, "message");
  if (!rawMessage) return false;
  const message = rawMessage.toLowerCase();
  return message.includes("failed to fetch") || message.includes("abort");
};

export const isSupabaseNetworkLikeError = (error: unknown): boolean => {
  const msg = (readStringProperty(error, "message") || "").toLowerCase();
  return (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("connection") ||
    readStringProperty(error, "code") === "NETWORK_ERROR"
  );
};
