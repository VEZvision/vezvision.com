import { useEffect, useState } from 'react';
import { sanitizeCmsHtml } from '@/utils/sanitizeCmsHtml';
import { fetchCodeInjection } from '@/services/codeInjection';

/** SEO-critical rels (canonical, alternate) are app-owned via Helmet — never from CMS head. */
const ALLOWED_LINK_RELS = new Set(['icon', 'shortcut', 'shortcut icon', 'apple-touch-icon', 'manifest']);

function hasAllowedLinkRel(relValue: string): boolean {
    const tokens = relValue.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return tokens.some((token) => ALLOWED_LINK_RELS.has(token));
}
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
        return url.protocol === 'https:';
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

        if (safeMeta.getAttribute('http-equiv')?.toLowerCase() === 'refresh') {
            continue;
        }

        if (safeMeta.attributes.length > 0) {
            markInjectedNode(safeMeta, CMS_HEAD_MARKER);
            fragment.appendChild(safeMeta);
        }
    }

    for (const link of template.content.querySelectorAll('link')) {
        const rel = link.getAttribute('rel')?.trim().toLowerCase() ?? '';
        const href = link.getAttribute('href');
        if (!href || !hasAllowedLinkRel(rel) || !isSafeHeadHref(href)) continue;

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
    const sanitizedBody = sanitizeCmsHtml(markup.slice(0, MAX_BODY_MARKUP_LENGTH));
    const range = document.createRange();
    range.setStart(document.body, 0);
    const fragment = range.createContextualFragment(sanitizedBody);

    for (const node of fragment.childNodes) {
        markInjectedNode(node, CMS_BODY_MARKER);
    }

    document.body.appendChild(fragment);
}

interface CodeInjectionMarkup {
    head: string;
    body: string;
}

interface CodeInjectorProps {
    delayMs?: number;
}

const CodeInjector = ({ delayMs = 2000 }: CodeInjectorProps) => {
    const [markup, setMarkup] = useState<CodeInjectionMarkup>({ head: '', body: '' });

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const load = () => {
            timer = setTimeout(() => {
                void fetchCodeInjection().then((code) => {
                    if (active) {
                        setMarkup({
                            head: code.head.trim(),
                            body: code.body.trim(),
                        });
                    }
                });
            }, delayMs);
        };

        if (typeof window.requestIdleCallback === 'function') {
            const idleId = window.requestIdleCallback(load, { timeout: 3000 });
            return () => {
                active = false;
                window.cancelIdleCallback(idleId);
                if (timer) clearTimeout(timer);
            };
        }

        load();
        return () => {
            active = false;
            if (timer) clearTimeout(timer);
        };
    }, [delayMs]);

    useEffect(() => {
        clearInjectedNodes(CMS_HEAD_MARKER);
        clearInjectedNodes(CMS_BODY_MARKER);

        if (markup.head) {
            document.head.appendChild(buildSafeHeadFragment(markup.head));
        }

        if (markup.body) {
            injectBodyMarkup(markup.body);
        }

        return () => {
            clearInjectedNodes(CMS_HEAD_MARKER);
            clearInjectedNodes(CMS_BODY_MARKER);
        };
    }, [markup.head, markup.body]);

    return null;
};

export default CodeInjector;
