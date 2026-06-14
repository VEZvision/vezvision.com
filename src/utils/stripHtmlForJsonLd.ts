import { sanitizeCmsHtml } from './sanitizeCmsHtml';

/**
 * Plain text for schema.org JSON-LD (strips tags, decodes entities).
 */
export function stripHtmlForJsonLd(html: string): string {
  if (!html) return '';

  if (typeof document === 'undefined') {
    return sanitizeCmsHtml(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const template = document.createElement('template');
  template.innerHTML = sanitizeCmsHtml(html);
  return (template.content.textContent ?? '').replace(/\s+/g, ' ').trim();
}
