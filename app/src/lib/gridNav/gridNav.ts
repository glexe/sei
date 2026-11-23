import { COLS } from './constants';

export const rowOf = (index: number, cols = COLS): number => Math.floor(index / cols);

export const colOf = (index: number, cols = COLS): number => index % cols;

export function moveFocus(
  index: number,
  dx: number,
  dy: number,
  count: number,
  cols = COLS,
): number {
  if (count === 0) return 0;
  const row = rowOf(index, cols);
  const col = colOf(index, cols);

  if (dx) {
    const next = index + dx;
    const rowStart = row * cols;
    const rowEnd = Math.min(count - 1, rowStart + cols - 1);
    return next < rowStart || next > rowEnd ? index : next;
  }

  const lastRow = rowOf(count - 1, cols);
  const r = row + dy;
  if (r < 0 || r > lastRow) return index;
  return Math.min(r * cols + col, count - 1);
}
