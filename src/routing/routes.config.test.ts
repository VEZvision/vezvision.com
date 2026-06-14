import { describe, expect, it } from 'vitest';

import { isDynamicContentPath } from '@/routing/routes.config';

describe('isDynamicContentPath', () => {
  it('detects localized blog and portfolio detail routes', () => {
    expect(isDynamicContentPath('/pl/blog/my-post')).toBe(true);
    expect(isDynamicContentPath('/en/portfolio/acme')).toBe(true);
  });

  it('ignores list pages and static routes', () => {
    expect(isDynamicContentPath('/pl/blog')).toBe(false);
    expect(isDynamicContentPath('/en/contact')).toBe(false);
  });
});
