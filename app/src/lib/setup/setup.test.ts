import { describe, expect, it } from 'vitest';
import { isNewer, needsUpdate } from './setup';

describe('isNewer', () => {
  it.each([
    ['0.9.1', '0.9.0'],
    ['0.10.0', '0.9.9'],
    ['1.0.0', '0.99.99'],
  ])('%s is newer than %s', (a, b) => {
    expect(isNewer(a, b)).toBe(true);
    expect(isNewer(b, a)).toBe(false);
  });

  it('is false for the same version or none', () => {
    expect(isNewer('0.9.1', '0.9.1')).toBe(false);
    expect(isNewer('', '0.9.1')).toBe(false);
  });
});

describe('needsUpdate', () => {
  it('installs a newer package once', () => {
    expect(needsUpdate('0.9.2', '0.9.1', '')).toBe(true);
    expect(needsUpdate('0.9.2', '0.9.1', '0.9.2')).toBe(false);
    expect(needsUpdate('0.9.3', '0.9.1', '0.9.2')).toBe(true);
  });

  it('leaves the same or an older package alone', () => {
    expect(needsUpdate('0.9.1', '0.9.1', '')).toBe(false);
    expect(needsUpdate('0.9.0', '0.9.1', '')).toBe(false);
  });
});
