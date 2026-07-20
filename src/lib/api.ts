type ApiError = Error & { status?: number; code?: string };

export type ApiResult<T> = {
  data: T | null;
  error: ApiError | null;
  count?: number | null;
};

const configuredUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");
const requestTimeoutMs = 15_000;

/**
 * Public API transport for the self-hosted PostgREST gateway.
 * No Supabase SDK, project URL or browser key is used.
 */
export function getApiBaseUrl(): string {
  if (!configuredUrl)
    throw new Error("Missing VITE_API_URL environment variable");
  return configuredUrl;
}

function messageFrom(response: Response, body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  )
    return body.message;
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  )
    return body.error;
  return `API request failed (${response.status})`;
}

function apiError(message: string, status?: number): ApiError {
  return status === undefined
    ? new Error(message)
    : Object.assign(new Error(message), { status });
}

function serializeValue(value: unknown): string {
  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
    ? String(value)
    : JSON.stringify(value);
}

function createRequestSignal(signal?: AbortSignal): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  let cleanedUp = false;
  const timeout = globalThis.setTimeout(
    () => controller.abort(new Error("API request timed out")),
    requestTimeoutMs,
  );
  const abort = () => controller.abort(signal?.reason);

  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      if (cleanedUp) return;
      cleanedUp = true;
      globalThis.clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    },
  };
}

class RestQuery<T = unknown> implements PromiseLike<ApiResult<T>> {
  private readonly params = new URLSearchParams();
  private headers: Record<string, string> = { accept: "application/json" };
  private signal?: AbortSignal;
  private optionalSingle = false;

  constructor(private readonly table: string) {}

  select(columns: string, options?: { count?: "exact"; head?: boolean }) {
    this.params.set("select", columns.replace(/\s+/g, " ").trim());
    if (options?.count === "exact") this.headers.Prefer = "count=exact";
    if (options?.head)
      this.headers.Prefer = [this.headers.Prefer, "count=exact"]
        .filter(Boolean)
        .join(",");
    return this;
  }
  eq(column: string, value: unknown) {
    this.params.set(column, `eq.${serializeValue(value)}`);
    return this;
  }
  lte(column: string, value: unknown) {
    this.params.set(column, `lte.${serializeValue(value)}`);
    return this;
  }
  lt(column: string, value: unknown) {
    this.params.set(column, `lt.${serializeValue(value)}`);
    return this;
  }
  gte(column: string, value: unknown) {
    this.params.set(column, `gte.${serializeValue(value)}`);
    return this;
  }
  gt(column: string, value: unknown) {
    this.params.set(column, `gt.${serializeValue(value)}`);
    return this;
  }
  is(column: string, value: unknown) {
    this.params.set(
      column,
      `is.${value === null ? "null" : serializeValue(value)}`,
    );
    return this;
  }
  in(column: string, values: readonly unknown[]) {
    this.params.set(column, `in.(${values.map(serializeValue).join(",")})`);
    return this;
  }
  or(expression: string) {
    this.params.set("or", `(${expression})`);
    return this;
  }
  order(
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ) {
    this.params.set(
      "order",
      `${column}.${options?.ascending === false ? "desc" : "asc"}`,
    );
    return this;
  }
  limit(value: number) {
    this.params.set("limit", String(value));
    return this;
  }
  range(from: number, to: number) {
    this.params.set("offset", String(from));
    this.params.set("limit", String(Math.max(0, to - from + 1)));
    return this;
  }
  abortSignal(signal: AbortSignal) {
    this.signal = signal;
    return this;
  }
  single() {
    this.headers.accept = "application/vnd.pgrst.object+json";
    return this;
  }
  maybeSingle() {
    this.optionalSingle = true;
    this.headers.accept = "application/vnd.pgrst.object+json";
    return this;
  }

  async execute(): Promise<ApiResult<T>> {
    const url = `${getApiBaseUrl()}/rest/v1/${this.table}?${this.params}`;
    const requestSignal = createRequestSignal(this.signal);
    try {
      const response = await fetch(url, {
        headers: this.headers,
        signal: requestSignal.signal,
      });
      if (this.optionalSingle && response.status === 406)
        return { data: null, error: null };
      const text = await response.text();
      const body: unknown = text ? JSON.parse(text) : null;
      if (!response.ok)
        return {
          data: null,
          error: apiError(messageFrom(response, body), response.status),
        };
      const total = response.headers.get("content-range")?.split("/").at(-1);
      return {
        data: body as T,
        error: null,
        count: total && total !== "*" ? Number(total) : null,
      };
    } catch (cause) {
      return {
        data: null,
        error: apiError(
          cause instanceof Error ? cause.message : "Network error",
        ),
      };
    } finally {
      requestSignal.cleanup();
    }
  }

  then<TResult1 = ApiResult<T>, TResult2 = never>(
    onfulfilled?:
      ((value: ApiResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function getApiClient() {
  return {
    from<T = unknown>(table: string) {
      return new RestQuery<T>(table);
    },
    async invoke<T = unknown>(
      name: string,
      body?: unknown,
    ): Promise<{ data: T | null; error: ApiError | null }> {
      const requestSignal = createRequestSignal();
      try {
        const response = await fetch(
          `${getApiBaseUrl()}/functions/v1/${name}`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(body ?? {}),
            signal: requestSignal.signal,
          },
        );
        const text = await response.text();
        const data = text ? (JSON.parse(text) as T) : null;
        return response.ok
          ? { data, error: null }
          : {
              data: null,
              error: apiError(messageFrom(response, data), response.status),
            };
      } catch (cause) {
        return {
          data: null,
          error: apiError(
            cause instanceof Error ? cause.message : "Network error",
          ),
        };
      } finally {
        requestSignal.cleanup();
      }
    },
  };
}
