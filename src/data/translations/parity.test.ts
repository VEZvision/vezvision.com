import { describe, expect, it } from 'vitest';

import { enTranslations } from './en';
import { plTranslations } from './pl';

function diffKeys(left: string[], right: string[]) {
  const rightSet = new Set(right);
  const leftSet = new Set(left);
  return {
    onlyInLeft: left.filter((key) => !rightSet.has(key)),
    onlyInRight: right.filter((key) => !leftSet.has(key)),
  };
}

describe('translation parity', () => {
  it('PL and EN expose the same translation keys', () => {
    const plKeys = Object.keys(plTranslations).sort();
    const enKeys = Object.keys(enTranslations).sort();
    const { onlyInLeft, onlyInRight } = diffKeys(plKeys, enKeys);

    expect(onlyInLeft, `Missing in EN: ${onlyInLeft.join(', ')}`).toEqual([]);
    expect(onlyInRight, `Missing in PL: ${onlyInRight.join(', ')}`).toEqual([]);
  });
});
