import { getSupabase } from "@/lib/supabase";
import { logError } from "@/lib/logger";
import { isAbortLikeError } from "./utils";
import { applyPublishedBlogVisibilityFilter } from "./blogFilters";
import type { BlogPost, BlogPostTranslation } from "@/types/blog";

export interface BlogCategory {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface BlogPostWithDetails extends BlogPost {
  translations: BlogPostTranslation[];
  categories: BlogCategory[];
}

export type BlogContentLanguage = "pl" | "en";

interface DBPostCategory {
  vv_blog_categories?: {
    id: string;
    slug: string;
    name_pl?: string;
    name_en?: string | null;
    color?: string;
    created_at: string;
  };
}

interface DBBlogPost {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  featured_image: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
  views_count: number;
  reading_time?: number;
  title_pl?: string;
  title_en?: string;
  excerpt_pl?: string;
  excerpt_en?: string;
  content_pl?: string;
  content_en?: string;
  meta_title_pl?: string;
  meta_title_en?: string;
  meta_desc_pl?: string;
  meta_desc_en?: string;
  tags_pl?: string[];
  tags_en?: string[];
  vv_blog_post_categories?: DBPostCategory[];
}

interface DBBlogCategory {
  id: string;
  slug: string;
  name_pl?: string;
  name_en?: string | null;
  color?: string;
  created_at: string;
}

export function localizedBlogCategoryName(
  category: Pick<DBBlogCategory, "name_pl" | "name_en" | "slug">,
  language: BlogContentLanguage,
): string {
  if (language === "en") {
    return (
      category.name_en?.trim() || category.name_pl?.trim() || category.slug
    );
  }
  return category.name_pl?.trim() || category.slug;
}

const mapCategoryFromDB = (
  category: DBBlogCategory,
  language: BlogContentLanguage,
): BlogCategory => ({
  id: category.id,
  name: localizedBlogCategoryName(category, language),
  color: category.color || "#000000",
  created_at: category.created_at,
});

const mapPostFromDB = (
  post: DBBlogPost,
  language: BlogContentLanguage,
): BlogPostWithDetails => {
  const translations: BlogPostTranslation[] = [
    {
      id: `${post.id}-pl`,
      post_id: post.id,
      language: "pl",
      title: post.title_pl || "",
      excerpt: post.excerpt_pl || "",
      content: post.content_pl || "",
      seo_title: post.meta_title_pl,
      seo_description: post.meta_desc_pl,
      seo_keywords: post.tags_pl,
    },
    {
      id: `${post.id}-en`,
      post_id: post.id,
      language: "en",
      title: post.title_en || "",
      excerpt: post.excerpt_en || "",
      content: post.content_en || "",
      seo_title: post.meta_title_en,
      seo_description: post.meta_desc_en,
      seo_keywords: post.tags_en,
    },
  ];

  const categories: BlogCategory[] = (post.vv_blog_post_categories || [])
    .map((postCategory) => postCategory.vv_blog_categories)
    .filter((category): category is NonNullable<typeof category> =>
      Boolean(category),
    )
    .map((category) => mapCategoryFromDB(category, language));

  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    published_at: post.published_at,
    featured_image: post.featured_image,
    is_featured: post.featured,
    created_at: post.created_at,
    updated_at: post.updated_at,
    views_count: post.views_count || 0,
    reading_time: post.reading_time,
    translations,
    categories,
  };
};

const BLOG_LIST_POST_SELECT = `
  id, slug, status, published_at, featured_image, featured, created_at, updated_at,
  views_count, reading_time, title_pl, title_en, excerpt_pl, excerpt_en,
  meta_title_pl, meta_title_en, meta_desc_pl, meta_desc_en, tags_pl, tags_en,
  vv_blog_post_categories(vv_blog_categories(id, slug, name_pl, name_en, color, created_at))
`;

const BLOG_DETAIL_POST_SELECT = `
  id, slug, status, published_at, featured_image, featured, created_at, updated_at,
  views_count, reading_time, title_pl, title_en, excerpt_pl, excerpt_en,
  content_pl, content_en, meta_title_pl, meta_title_en, meta_desc_pl, meta_desc_en,
  tags_pl, tags_en,
  vv_blog_post_categories(vv_blog_categories(id, slug, name_pl, name_en, color, created_at))
`;

export async function listPublishedBlogContent(
  signal?: AbortSignal,
  language: BlogContentLanguage = "pl",
  limit = 100,
): Promise<{
  posts: BlogPostWithDetails[];
  categories: BlogCategory[];
}> {
  try {
    const supabase = await getSupabase();
    let postsQuery = applyPublishedBlogVisibilityFilter(
      supabase
        .from("vv_blog_posts")
        .select(BLOG_LIST_POST_SELECT)
        .eq("status", "published"),
    )
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (signal) postsQuery = postsQuery.abortSignal(signal);
    const { data: postsData, error: postsError } = await postsQuery;

    if (postsError) throw postsError;

    let categoriesQuery = supabase
      .from("vv_blog_categories")
      .select("id, slug, name_pl, name_en, color, created_at")
      .order("created_at", { ascending: true })
      .limit(100);

    if (signal) categoriesQuery = categoriesQuery.abortSignal(signal);
    const { data: rawCategories, error: categoriesError } =
      await categoriesQuery;

    if (categoriesError) throw categoriesError;

    return {
      posts: (postsData || []).map((post) =>
        mapPostFromDB(post as DBBlogPost, language),
      ),
      categories: (rawCategories || []).map((category) =>
        mapCategoryFromDB(category as DBBlogCategory, language),
      ),
    };
  } catch (error) {
    if (isAbortLikeError(error)) throw new Error("Request aborted");
    logError("blog.list", error);
    throw new Error("Failed to list blog content");
  }
}

export async function getPublishedPostBySlug(
  slug: string,
  signal?: AbortSignal,
  language: BlogContentLanguage = "pl",
): Promise<BlogPostWithDetails | null> {
  try {
    const supabase = await getSupabase();
    let postQuery = applyPublishedBlogVisibilityFilter(
      supabase
        .from("vv_blog_posts")
        .select(BLOG_DETAIL_POST_SELECT)
        .eq("slug", slug)
        .eq("status", "published"),
    );

    if (signal) postQuery = postQuery.abortSignal(signal);
    const { data: post, error: postError } = await postQuery.single();

    if (postError) {
      if (postError.code === "PGRST116") return null;
      throw postError;
    }
    if (!post) return null;

    return mapPostFromDB(post as DBBlogPost, language);
  } catch (error) {
    if (isAbortLikeError(error)) throw new Error("Request aborted");
    logError("blog.getBySlug", error);
    throw new Error("Failed to load blog post");
  }
}

export async function incrementBlogViewCount(slug: string): Promise<boolean> {
  try {
    const supabase = await getSupabase();
    const response = await supabase.functions.invoke<{ success?: boolean }>(
      "increment-blog-view",
      {
        body: { slug },
      },
    );

    return !response.error && response.data?.success === true;
  } catch {
    return false;
  }
}
