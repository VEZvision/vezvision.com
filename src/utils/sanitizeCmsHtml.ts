import DOMPurify from 'dompurify';

import { safeImageUrl } from '@/utils/safeHref';

const CMS_ALLOWED_TAGS = [
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'sub', 'sup', 'u', 'ul',
] as const;

const CMS_ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'class', 'src', 'alt', 'width', 'height', 'loading'] as const;

let hooksRegistered = false;

function registerSanitizeHooks(): void {
  if (hooksRegistered) return;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const target = node.getAttribute('target');
      if (target === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
      } else {
        const rel = node.getAttribute('rel') ?? '';
        if (!/\bnoopener\b/.test(rel) || !/\bnoreferrer\b/.test(rel)) {
          node.setAttribute('rel', rel ? `${rel} noopener noreferrer`.trim() : 'noopener noreferrer');
        }
      }
    }

    if (node.tagName === 'IMG') {
      const src = node.getAttribute('src');
      const safeSrc = safeImageUrl(src);
      if (!safeSrc) {
        node.remove();
        return;
      }
      node.setAttribute('src', safeSrc);
      node.setAttribute('loading', node.getAttribute('loading') === 'eager' ? 'eager' : 'lazy');
    }
  });

  hooksRegistered = true;
}

/**
 * Hardened HTML sanitizer for CMS-authored content (blog, FAQ, portfolio).
 */
export function sanitizeCmsHtml(dirty: string): string {
  if (!dirty) return '';

  registerSanitizeHooks();

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [...CMS_ALLOWED_TAGS],
    ALLOWED_ATTR: [...CMS_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}
