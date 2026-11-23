import { describe, expect, it } from 'vitest';
import { COLS } from '../lib/gridNav/constants';
import { VISIBLE_ROWS } from '../primitives/List/constants';
import { VISIBLE_ITEMS } from '../primitives/TrackMenu/constants';
import css from './variables.css?raw';

const tokens = new Map<string, string>();
for (const [, name, value] of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) tokens.set(name, value);

// Evaluates a token's calc() in px.
function px(name: string): number {
  const value = tokens.get(name);
  if (!value) throw new Error(`no token ${name}`);
  const plain = value
    .replace(/var\((--[\w-]+)\)/g, (_, ref: string) => `(${px(ref)})`)
    .replace(/calc|px/g, '');
  return Number(new Function(`return ${plain}`)());
}

describe('counts shared with code', () => {
  it.each([
    ['--cols', COLS],
    ['--list-rows', VISIBLE_ROWS],
    ['--track-menu-items', VISIBLE_ITEMS],
  ])('%s', (name, count) => {
    expect(px(name)).toBe(count);
  });
});

describe('grid geometry', () => {
  // Whole pixels keep tile edges crisp without antialiasing.
  it.each(['--side-pad', '--row-pitch', '--shelf-pad-x', '--shelf-pad-y', '--shelf-top'])(
    '%s is a whole number of pixels',
    (name) => {
      expect(px(name)).toBeCloseTo(Math.round(px(name)), 6);
    },
  );

  it('keeps the dock on the screen', () => {
    expect(px('--side-pad')).toBeGreaterThanOrEqual(px('--shelf-pad-x'));
    expect(px('--shelf-top')).toBeGreaterThan(0);
  });

  it('keeps focused tiles from overlapping their neighbors', () => {
    expect((px('--tile-w') * (px('--focus-scale') - 1)) / 2).toBeLessThan(px('--tile-gap'));
  });

  it('leaves room for a tile name between rows', () => {
    const below = px('--tile-h') / 2 + px('--tile-title-gap') + px('--tile-title-h');
    const nextTile = px('--tile-h') / 2 + px('--row-gap');
    expect(below * px('--focus-scale')).toBeLessThanOrEqual(nextTile);
  });
});
