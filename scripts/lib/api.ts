type Result<T = unknown> = { data: T | null; error: { message: string } | null }

class Query<T = unknown> implements PromiseLike<Result<T>> {
  private params = new URLSearchParams()
  private accept = 'application/json'
  constructor(private readonly table: string) {}
  select(value: string) { this.params.set('select', value.replace(/\s+/g, ' ').trim()); return this }
  eq(key: string, value: unknown) { this.params.set(key, `eq.${String(value)}`); return this }
  lte(key: string, value: unknown) { this.params.set(key, `lte.${String(value)}`); return this }
  or(value: string) { this.params.set('or', `(${value})`); return this }
  order(key: string, options?: { ascending?: boolean }) { this.params.set('order', `${key}.${options?.ascending === false ? 'desc' : 'asc'}`); return this }
  limit(value: number) { this.params.set('limit', String(value)); return this }
  single() { this.accept = 'application/vnd.pgrst.object+json'; return this }
  async execute(): Promise<Result<T>> {
    try {
      const response = await fetch(`${getScriptApiBaseUrl()}/rest/v1/${this.table}?${this.params}`, { headers: { accept: this.accept } })
      const body = await response.json().catch(() => null)
      return response.ok ? { data: body as T, error: null } : { data: null, error: { message: `API request failed (${response.status})` } }
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Network error' } }
    }
  }
  then<TResult1 = Result<T>, TResult2 = never>(onfulfilled?: ((value: Result<T>) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) { return this.execute().then(onfulfilled, onrejected) }
}

export function getScriptApiBaseUrl(): string {
  const url = process.env.VITE_API_URL?.trim().replace(/\/$/, '')
  if (!url) throw new Error('Missing VITE_API_URL environment variable')
  return url
}

export function getScriptApi() {
  return { from<T = unknown>(table: string) { return new Query<T>(table) } }
}
