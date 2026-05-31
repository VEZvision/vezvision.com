import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useSettings } from '@/hooks/useSettings';

/**
 * CodeInjector — injects admin-controlled HTML/JS snippets from vv_site_settings.
 *
 * SECURITY MODEL:
 * - Write access is restricted to admins via RLS (vv_is_admin()).
 * - Head injection: allows <script>, <style>, <link>, <meta>, <noscript> for
 *   analytics and SEO use cases. This is intentional — head injection exists
 *   to let admins add tracking scripts. Risk is acceptable because only admins
 *   can modify these settings.
 * - Body injection: sanitized strictly via DOMPurify (scripts stripped).
 *   Body injection is for visual HTML content, not script execution.
 *
 * If admin access is ever compromised, the attacker can inject arbitrary JS
 * via the head slot. This is an accepted risk for a CMS-style code injection
 * feature. Mitigate by protecting admin accounts and monitoring vv_site_settings
 * changes.
 */
const CodeInjector = () => {
    const injectedRef = useRef(false);
    const { code } = useSettings();

    useEffect(() => {
        if (injectedRef.current || !code || typeof code !== 'object') return;
        injectedRef.current = true;

        const settings = code as { head?: string; body?: string };

        // Head: allow analytics scripts, styles, meta tags — admin-controlled
        if (settings.head && typeof settings.head === 'string' && settings.head.trim()) {
            const sanitizedHead = DOMPurify.sanitize(settings.head, {
                ADD_TAGS: ['script', 'style', 'link', 'meta', 'noscript'],
                ADD_ATTR: ['async', 'defer', 'src', 'href', 'rel', 'content', 'name', 'charset', 'type', 'integrity', 'crossorigin'],
            });
            const range = document.createRange();
            range.setStart(document.head, 0);
            document.head.appendChild(range.createContextualFragment(sanitizedHead));
        }

        // Body: strictly sanitized — only safe HTML, no scripts
        if (settings.body && typeof settings.body === 'string' && settings.body.trim()) {
            const sanitizedBody = DOMPurify.sanitize(settings.body);
            const range = document.createRange();
            range.setStart(document.body, 0);
            document.body.appendChild(range.createContextualFragment(sanitizedBody));
        }
    }, [code]);

    return null;
};

export default CodeInjector;
