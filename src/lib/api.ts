type ApiError = { message: string; status?: number; code?: string }

export type ApiResult<T> = { data: T | null; error: ApiError | null; count?: number | null }

const configuredUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '')

/**
 * Public API transport for the self-hosted PostgREST gateway.
 * No Supabase SDK, project URL or browser key is used.
 */
export function getApiBaseUrl(): string {
  if (!configuredUrl) throw new Error('Missing VITE_API_URL environment variable')
  return configuredUrl
}

function messageFrom(response: Response, body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') return body.message
  return `API request failed (${response.status})`
}

class RestQuery<T = any> implements PromiseLike<ApiResult<T>> {
  private readonly params = new URLSearchParams()
  private headers: Record<string, string> = { accept: 'application/json' }
  private signal?: AbortSignal
  private optionalSingle = false

  constructor(private readonly table: string) {}

  select(columns: string, options?: { count?: 'exact'; head?: boolean }) {
    this.params.set('select', columns.replace(/\s+/g, ' ').trim())
    if (options?.count === 'exact') this.headers.Prefer = 'count=exact'
    if (options?.head) this.headers.Prefer = [this.headers.Prefer, 'count=exact'].filter(Boolean).join(',')
    return this
  }
  eq(column: string, value: unknown) { this.params.set(column, `eq.${String(value)}`); return this }
  lte(column: string, value: unknown) { this.params.set(column, `lte.${String(value)}`); return this }
  lt(column: string, value: unknown) { this.params.set(column, `lt.${String(value)}`); return this }
  gte(column: string, value: unknown) { this.params.set(column, `gte.${String(value)}`); return this }
  gt(column: string, value: unknown) { this.params.set(column, `gt.${String(value)}`); return this }
  is(column: string, value: unknown) { this.params.set(column, `is.${value === null ? 'null' : String(value)}`); return this }
  in(column: string, values: readonly unknown[]) { this.params.set(column, `in.(${values.map(String).join(',')})`); return this }
  or(expression: string) { this.params.set('or', `(${expression})`); return this }
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) { this.params.set('order', `${column}.${options?.ascending === false ? 'desc' : 'asc'}`); return this }
  limit(value: number) { this.params.set('limit', String(value)); return this }
  range(from: number, to: number) { this.params.set('offset', String(from)); this.params.set('limit', String(Math.max(0, to - from + 1))); return this }
  abortSignal(signal: AbortSignal) { this.signal = signal; return this }
  single() { this.headers.Accept = 'application/vnd.pgrst.object+json'; return this }
  maybeSingle() { this.optionalSingle = true; this.headers.Accept = 'application/vnd.pgrst.object+json'; return this }

  async execute(): Promise<ApiResult<T>> {
    const url = `${getApiBaseUrl()}/rest/v1/${this.table}?${this.params}`
    try {
      const response = await fetch(url, { headers: this.headers, ...(this.signal ? { signal: this.signal } : {}) })
      if (this.optionalSingle && response.status === 406) return { data: null, error: null }
      const text = await response.text()
      const body = text ? JSON.parse(text) : null
      if (!response.ok) return { data: null, error: { message: messageFrom(response, body), status: response.status } }
      const total = response.headers.get('content-range')?.split('/').at(-1)
      return { data: body as T, error: null, count: total && total !== '*' ? Number(total) : null }
    } catch (cause) {
      return { data: null, error: { message: cause instanceof Error ? cause.message : 'Network error' } }
    }
  }

  then<TResult1 = ApiResult<T>, TResult2 = never>(onfulfilled?: ((value: ApiResult<T>) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) {
    return this.execute().then(onfulfilled, onrejected)
  }
}

export function getApiClient() {
  return {
    from<T = any>(table: string) { return new RestQuery<T>(table) },
    async invoke<T = unknown>(name: string, body?: unknown): Promise<{ data: T | null; error: ApiError | null }> {
      try {
        const response = await fetch(`${getApiBaseUrl()}/functions/v1/${name}`, {
          method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body ?? {}),
        })
        const text = await response.text()
        const data = text ? JSON.parse(text) as T : null
        return response.ok ? { data, error: null } : { data: null, error: { message: messageFrom(response, data), status: response.status } }
      } catch (cause) {
        return { data: null, error: { message: cause instanceof Error ? cause.message : 'Network error' } }
      }
    },
  }
}
