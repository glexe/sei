import { describe, expect, it } from 'vitest';
import { moveFocus, rowOf, colOf } from './gridNav';

describe('moveFocus (6 columns)', () => {
  it('moves within a row and stops at its edges', () => {
    expect(moveFocus(0, 1, 0, 20)).toBe(1);
    expect(moveFocus(0, -1, 0, 20)).toBe(0);
    expect(moveFocus(5, 1, 0, 20)).toBe(5);
  });

  it('moves between rows and clamps into a shorter last row', () => {
    expect(moveFocus(1, 0, 1, 20)).toBe(7);
    expect(moveFocus(17, 0, 1, 20)).toBe(19);
    expect(moveFocus(2, 0, -1, 20)).toBe(2);
  });

  it('stops at the last item of a partial row', () => {
    expect(moveFocus(19, 1, 0, 20)).toBe(19);
  });

  it('handles an empty grid', () => {
    expect(moveFocus(3, 1, 0, 0)).toBe(0);
  });
});

describe('rows', () => {
  it('maps indices to rows and the top row', () => {
    expect(rowOf(5)).toBe(0);
    expect(rowOf(6)).toBe(1);
    expect(colOf(14)).toBe(2);
  });
});
