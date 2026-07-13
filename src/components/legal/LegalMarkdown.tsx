import { lazy, Suspense } from "react";
import { useLanguageContext } from "@/hooks/useLanguage";
import { localizeInternalHref } from "@/routing/locale";
import { isSafeExternalHref, isSafeInternalHref } from "@/utils/safeHref";

const ReactMarkdown = lazy(() => import("react-markdown"));

interface LegalMarkdownProps {
  content: string;
}

function safeMarkdownHref(
  href: string | undefined,
  language: "pl" | "en",
): string | undefined {
  if (!href) return undefined;
  const trimmed = href.trim();
  if (isSafeExternalHref(trimmed)) {
    return trimmed;
  }
  if (isSafeInternalHref(trimmed)) {
    return localizeInternalHref(trimmed, language);
  }
  return undefined;
}

const LegalMarkdown = ({ content }: LegalMarkdownProps) => {
  const { language } = useLanguageContext();

  return (
    <Suspense
      fallback={
        <div
          className="animate-pulse h-32 bg-gray-100 rounded-sm"
          aria-label="Loading content"
        />
      }
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-6">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          a: ({ href, children }) => {
            const safeHref = safeMarkdownHref(href, language);
            if (!safeHref) {
              return <span className="text-gray-700">{children}</span>;
            }

            const external = isSafeExternalHref(safeHref);
            return (
              <a
                href={safeHref}
                className="text-blue-600 hover:underline"
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Suspense>
  );
};

export default LegalMarkdown;
