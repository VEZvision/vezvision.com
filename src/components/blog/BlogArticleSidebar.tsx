import { Link } from "react-router-dom";
import { Mail, Tag } from "lucide-react";

import logo from "@brand/icon-dark.svg";
import { safeImageUrl } from "@/utils/safeHref";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import type { BlogPostWithDetails } from "@/hooks/useBlog";

type BlogArticleSidebarProps = {
  recentPosts: BlogPostWithDetails[];
  getPostTranslation: (
    post: BlogPostWithDetails,
    lang: "pl" | "en",
  ) => ReturnType<
    ReturnType<typeof import("@/hooks/useBlog").useBlog>["getPostTranslation"]
  >;
};

export default function BlogArticleSidebar({
  recentPosts,
  getPostTranslation,
}: BlogArticleSidebarProps) {
  const { language, t } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();

  return (
    <aside className="relative lg:block">
      <div className="sticky top-32 space-y-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Tag size={18} className="text-blue-500" />
            {t("blog.article.recent")}
          </h3>
          <div className="space-y-4">
            {recentPosts.map((post) => {
              const translation = getPostTranslation(
                post,
                language as "pl" | "en",
              );
              return (
                <Link
                  key={post.id}
                  to={toLocalizedPath(`blog/${post.slug}`)}
                  className="group -mx-2 flex gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg shadow-sm">
                    <img
                      src={safeImageUrl(post.featured_image) || logo}
                      alt={translation?.title}
                      width="80"
                      height="56"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.src = logo;
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="box-border line-clamp-2 max-h-10 overflow-hidden text-sm font-medium leading-snug text-gray-900 transition-colors group-hover:text-blue-600">
                      {translation?.title || "Brak tytułu"}
                    </span>
                    <span className="mt-1 text-xs text-gray-600">
                      {new Date(
                        post.published_at || post.created_at,
                      ).toLocaleDateString(
                        language === "pl" ? "pl-PL" : "en-US",
                      )}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Mail size={18} className="text-blue-500" />
            {t("newsletter.title")}
          </h3>
          <p className="mb-5 text-sm leading-6 text-gray-500">
            {t("newsletter.description")}
          </p>
          <Link
            to={toLocalizedPath("newsletter")}
            className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            {t("newsletter.submit")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
