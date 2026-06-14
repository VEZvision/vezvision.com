type OrFilterable<T> = {
  or: (filters: string) => T;
};

/**
 * Matches RLS: published posts with no schedule or publish date in the past.
 */
export function applyPublishedBlogVisibilityFilter<T extends OrFilterable<T>>(query: T): T {
  const now = new Date().toISOString();
  return query.or(`published_at.is.null,published_at.lte.${now}`);
}
