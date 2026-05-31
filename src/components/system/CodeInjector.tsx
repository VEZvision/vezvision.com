import { useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useSettings } from '@/hooks/useSettings';

const ALLOWED_LINK_RELS = new Set(['canonical', 'icon', 'shortcut icon', 'apple-touch-icon', 'manifest', 'alternate']);
const CMS_HEAD_MARKER = 'data-vez-cms-head';
const CMS_BODY_MARKER = 'data-vez-cms-body';
const MAX_HEAD_MARKUP_LENGTH = 32_000;
const MAX_BODY_MARKUP_LENGTH = 64_000;

function isSafeHeadHref(value: string | null): value is string {
    if (!value) return false;
    const trimmed = value.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;

    try {
        const url = new URL(trimmed);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}

function markInjectedNode(node: Node, marker: string): void {
    if (node instanceof Element) {
        node.setAttribute(marker, '');
    }
}

function clearInjectedNodes(marker: string): void {
    document.querySelectorAll(`[${marker}]`).forEach((node) => node.remove());
}

function buildSafeHeadFragment(markup: string): DocumentFragment {
    const template = document.createElement('template');
    template.innerHTML = markup.slice(0, MAX_HEAD_MARKUP_LENGTH);
    const fragment = document.createDocumentFragment();

    for (const meta of template.content.querySelectorAll('meta')) {
        const safeMeta = document.createElement('meta');

        for (const attr of ['name', 'property', 'content', 'charset', 'media']) {
            const value = meta.getAttribute(attr);
            if (value) safeMeta.setAttribute(attr, value);
        }

        if (safeMeta.attributes.length > 0) {
            markInjectedNode(safeMeta, CMS_HEAD_MARKER);
            fragment.appendChild(safeMeta);
        }
    }

    for (const link of template.content.querySelectorAll('link')) {
        const rel = link.getAttribute('rel')?.trim().toLowerCase() ?? '';
        const href = link.getAttribute('href');
        if (!href || !ALLOWED_LINK_RELS.has(rel) || !isSafeHeadHref(href)) continue;

        const safeLink = document.createElement('link');
        safeLink.setAttribute('rel', rel);
        safeLink.setAttribute('href', href.trim());

        const media = link.getAttribute('media');
        if (media) safeLink.setAttribute('media', media);

        markInjectedNode(safeLink, CMS_HEAD_MARKER);
        fragment.appendChild(safeLink);
    }

    return fragment;
}

function injectBodyMarkup(markup: string): void {
    const sanitizedBody = DOMPurify.sanitize(markup.slice(0, MAX_BODY_MARKUP_LENGTH));
    const range = document.createRange();
    range.setStart(document.body, 0);
    const fragment = range.createContextualFragment(sanitizedBody);

    for (const node of fragment.childNodes) {
        markInjectedNode(node, CMS_BODY_MARKER);
    }

    document.body.appendChild(fragment);
}

/**
 * CodeInjector — injects restricted admin-controlled markup from vv_site_settings.
 *
 * SECURITY MODEL:
 * - Write access is restricted to admins via RLS (vv_is_admin()).
 * - Head injection is limited to non-executable SEO/verification tags.
 *   Scripts and styles are stripped; analytics must use first-class integrations
 *   such as googleAnalyticsConsent.ts instead of arbitrary CMS code.
 * - Body injection is sanitized strictly via DOMPurify and cannot execute scripts.
 */
const CodeInjector = () => {
    const { code } = useSettings();
    const headMarkup = typeof code?.head === 'string' ? code.head.trim() : '';
    const bodyMarkup = typeof code?.body === 'string' ? code.body.trim() : '';

    useEffect(() => {
        clearInjectedNodes(CMS_HEAD_MARKER);
        clearInjectedNodes(CMS_BODY_MARKER);

        if (headMarkup) {
            document.head.appendChild(buildSafeHeadFragment(headMarkup));
        }

        if (bodyMarkup) {
            injectBodyMarkup(bodyMarkup);
        }

        return () => {
            clearInjectedNodes(CMS_HEAD_MARKER);
            clearInjectedNodes(CMS_BODY_MARKER);
        };
    }, [headMarkup, bodyMarkup]);

    return null;
};

export default CodeInjector;
