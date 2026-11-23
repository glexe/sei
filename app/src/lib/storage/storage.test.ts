import { afterEach, describe, expect, it, vi } from 'vitest';
import { isStringArray, readJson } from './storage';

describe('readJson', () => {
  afterEach(() => vi.unstubAllGlobals());

  const stub = (value: string | null) =>
    vi.stubGlobal('localStorage', { getItem: () => value, setItem: () => {} });

  it('returns the stored value when it has the expected shape', () => {
    stub('["a","b"]');
    expect(readJson('k', [], isStringArray)).toEqual(['a', 'b']);
  });

  it('falls back on missing, broken or wrongly shaped data', () => {
    stub(null);
    expect(readJson('k', ['x'], isStringArray)).toEqual(['x']);
    stub('{');
    expect(readJson('k', ['x'], isStringArray)).toEqual(['x']);
    stub('[1,2]');
    expect(readJson('k', ['x'], isStringArray)).toEqual(['x']);
  });
});
