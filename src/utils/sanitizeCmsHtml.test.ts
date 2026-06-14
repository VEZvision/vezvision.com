import { describe, expect, it } from 'vitest';

import { sanitizeCmsHtml } from './sanitizeCmsHtml';

describe('sanitizeCmsHtml', () => {
  it('strips script tags', () => {
    expect(sanitizeCmsHtml('<p>Hi</p><script>alert(1)</script>')).toBe('<p>Hi</p>');
  });

  it('adds rel noopener noreferrer on external links', () => {
    const html = sanitizeCmsHtml('<a href="https://example.com" target="_blank">link</a>');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('href="https://example.com"');
  });

  it('allows basic formatting tags', () => {
    expect(sanitizeCmsHtml('<p><strong>Bold</strong> text</p>')).toBe('<p><strong>Bold</strong> text</p>');
  });

  it('strips javascript links', () => {
    const html = sanitizeCmsHtml('<a href="javascript:alert(1)">x</a>');
    expect(html).not.toContain('javascript:');
  });

  it('keeps safe https images and strips unsafe src', () => {
    const safe = sanitizeCmsHtml('<p><img src="https://example.com/a.jpg" alt="A" /></p>');
    expect(safe).toContain('https://example.com/a.jpg');

    const unsafe = sanitizeCmsHtml('<p><img src="javascript:alert(1)" alt="X" /></p>');
    expect(unsafe).not.toContain('<img');
  });
});
