import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useBlogViewIncrement } from "@/hooks/useBlogViewIncrement";
import {
  getBlogPostTranslation,
  getAvailableBlogLocales,
  hasBlogPostTranslation,
  type BlogLocale,
} from "@/utils/blogTranslation";
import {
  getPublishedPostBySlug,
  listPublishedBlogContent,
  type BlogPostWithDetails,
} from "@/services/blog";

export type { BlogCategory, BlogPostWithDetails } from "@/services/blog";
export {
  getBlogPostTranslation,
  getAvailableBlogLocales,
  hasBlogPostTranslation,
};

export function useBlog() {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();
  const contentLanguage = language;
  const incrementViewCount = useBlogViewIncrement();

  const listQuery = useQuery({
    queryKey: queryKeys.blog.list(contentLanguage),
    queryFn: ({ signal }) => listPublishedBlogContent(signal, contentLanguage),
    staleTime: 5 * 60_000,
  });

  const posts = useMemo(
    () => listQuery.data?.posts ?? [],
    [listQuery.data?.posts],
  );
  const categories = useMemo(
    () => listQuery.data?.categories ?? [],
    [listQuery.data?.categories],
  );

  const getPostTranslation = useCallback(
    (post: BlogPostWithDetails, lang: BlogLocale) =>
      getBlogPostTranslation(post, lang),
    [],
  );

  const getFeaturedPosts = useCallback(
    () => posts.filter((post) => post.is_featured),
    [posts],
  );

  const getPostsByCategory = useCallback(
    (categoryId: string) =>
      posts.filter((post) =>
        post.categories.some((category) => category.id === categoryId),
      ),
    [posts],
  );

  const getRecentPosts = useCallback(
    (limit: number = 5) => posts.slice(0, limit),
    [posts],
  );

  const getPostBySlug = useCallback(
    (slug: string) => posts.find((post) => post.slug === slug),
    [posts],
  );

  const fetchPostBySlug = useCallback(
    async (
      slug: string,
      signal?: AbortSignal,
    ): Promise<BlogPostWithDetails | null> => {
      const cached = queryClient.getQueryData<BlogPostWithDetails>(
        queryKeys.blog.detail(slug, contentLanguage),
      );
      if (cached) return cached;

      const fromList = posts.find((post) => post.slug === slug);
      if (fromList) return fromList;

      const post = await getPublishedPostBySlug(slug, signal, contentLanguage);
      if (post) {
        queryClient.setQueryData(
          queryKeys.blog.detail(slug, contentLanguage),
          post,
        );
      }
      return post;
    },
    [queryClient, contentLanguage, posts],
  );

  const refreshPosts = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.blog.all });
  }, [queryClient]);

  return {
    posts,
    categories,
    loading: listQuery.isLoading,
    error:
      listQuery.error instanceof Error
        ? listQuery.error
        : listQuery.error
          ? new Error(String(listQuery.error))
          : null,
    getPostTranslation,
    getFeaturedPosts,
    getPostsByCategory,
    getRecentPosts,
    getPostBySlug,
    fetchPostBySlug,
    incrementViewCount,
    refreshPosts,
    contentLanguage,
  };
}

export function useBlogRecentPosts(limit = 5, excludePostId?: string) {
  const { language } = useLanguageContext();
  const contentLanguage = language;

  const recentQuery = useQuery({
    queryKey: [
      ...queryKeys.blog.all,
      "recent",
      contentLanguage,
      limit,
    ] as const,
    queryFn: ({ signal }) =>
      listPublishedBlogContent(signal, contentLanguage, limit + 1),
    staleTime: 5 * 60_000,
  });

  const posts = (recentQuery.data?.posts ?? [])
    .filter((post) => post.id !== excludePostId)
    .slice(0, limit);

  const getPostTranslation = useCallback(
    (post: BlogPostWithDetails, lang: BlogLocale) =>
      getBlogPostTranslation(post, lang),
    [],
  );

  return {
    posts,
    loading: recentQuery.isLoading,
    getPostTranslation,
  };
}

export function useBlogPostDetail(slug: string | undefined) {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();
  const contentLanguage = language;
  const incrementViewCount = useBlogViewIncrement();

  const detailQuery = useQuery({
    queryKey: queryKeys.blog.detail(slug ?? "", contentLanguage),
    queryFn: async ({ signal }) => {
      if (!slug) return null;

      const listData = queryClient.getQueryData<{
        posts: BlogPostWithDetails[];
      }>(queryKeys.blog.list(contentLanguage));
      const fromList = listData?.posts.find((post) => post.slug === slug);
      if (fromList) return fromList;

      return getPublishedPostBySlug(slug, signal, contentLanguage);
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const post = detailQuery.data ?? null;
  const isNotFound =
    Boolean(slug) &&
    !detailQuery.isLoading &&
    !detailQuery.isError &&
    (post === null || !hasBlogPostTranslation(post, contentLanguage));

  return {
    post,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    isNotFound,
    incrementViewCount,
    getAvailableBlogLocales: post ? getAvailableBlogLocales(post) : [],
  };
}
