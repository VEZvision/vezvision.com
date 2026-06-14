import { describe, expect, it } from 'vitest';

import { safeJsonLd } from '@/utils/safeJsonLd';

describe('DynamicPageSeo structured data', () => {
  it('serializes blog posting schema safely', () => {
    const json = safeJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Test <post>',
      url: 'https://vezvision.com/pl/blog/test',
    });

    expect(json).toContain('BlogPosting');
    expect(json).not.toContain('<post>');
  });
});
