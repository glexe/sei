import { useMemo } from 'preact/hooks';
import { MEMO_CACHE_SENTINEL } from './constants';

// Preact stand-in for react-compiler-runtime: a per-component cache of `size` slots.
export function c(size: number): unknown[] {
  return useMemo(() => Array.from<unknown>({ length: size }).fill(MEMO_CACHE_SENTINEL), []);
}
