import { Key } from '../../lib/remote/constants';
import type { Mode } from './types';

// How long a tile shows its pressed state after OK.
export const PRESS_MS = 150;

// Holding OK this long on a tile opens its menu.
export const HOLD_MS = 600;

// Arrow keys as grid steps, for Move.
export const STEPS: Record<number, [number, number]> = {
  [Key.Left]: [-1, 0],
  [Key.Right]: [1, 0],
  [Key.Up]: [0, -1],
  [Key.Down]: [0, 1],
};

export const GRID: Mode = { kind: 'grid' };
