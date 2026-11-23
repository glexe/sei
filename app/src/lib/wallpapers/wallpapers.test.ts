import { describe, expect, it } from 'vitest';
import credits from '../../assets/wallpapers/CREDITS.md?raw';
import { LOCALES } from '../i18n/constants';
import { WALLPAPERS } from './wallpapers';

const ids = WALLPAPERS.map((w) => w.id);
const pictures = WALLPAPERS.filter((w) => w.kind === 'pictures').map((w) => w.id);

it('gives every wallpaper its own id', () => {
  expect(new Set(ids).size).toBe(ids.length);
});

describe.each(pictures)('%s', (id) => {
  it('credits its author', () => {
    expect(credits).toMatch(new RegExp(`\\| \`${id}\` +\\| \\S`));
  });
});

describe.each(ids)('%s', (id) => {
  it('has a title in every language', () => {
    const missing = Object.keys(LOCALES).filter((lang) => !LOCALES[lang]?.wallpapers[id]);
    expect(missing).toEqual([]);
  });
});
