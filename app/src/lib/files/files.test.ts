import { describe, expect, it } from 'vitest';
import { formatDuration, formatSize, kindOf } from './files';

describe('files', () => {
  it('sorts files into kinds by extension', () => {
    expect(kindOf({ name: 'Movie.MKV', dir: false, size: 0, modified: 0 })).toBe('video');
    expect(kindOf({ name: 'Shows', dir: true, size: 0, modified: 0 })).toBe('folder');
    expect(kindOf({ name: 'readme', dir: false, size: 0, modified: 0 })).toBe('file');
  });

  it('formats sizes and durations in the UI language', () => {
    expect(formatSize(1_200_000_000, 'en')).toBe('1.2 GB');
    expect(formatSize(512, 'en')).toBe('512 byte');
    expect(formatDuration(4800, 'en')).toBe('1 hr 20 min');
    expect(formatDuration(20, 'en')).toBe('1 min');
  });
});
