import { describe, expect, it } from 'vitest';

import { stripHtmlForJsonLd } from './stripHtmlForJsonLd';

describe('stripHtmlForJsonLd', () => {
  it('returns plain text without tags', () => {
    expect(stripHtmlForJsonLd('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('collapses whitespace', () => {
    expect(stripHtmlForJsonLd('<p>Line one</p>\n<p>Line two</p>')).toBe('Line one Line two');
  });
});
