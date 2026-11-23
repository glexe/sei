import { useRef, useState } from 'preact/hooks';
import type { RefObject } from 'preact';
import type { Next } from './types';

// Key handlers read ref.current: held keys arrive faster than Preact re-renders.
export function useStateRef<T>(initial: T): [T, (next: Next<T>) => void, RefObject<T>] {
  const [value, setValue] = useState(initial);
  const ref = useRef(initial);

  const set = (next: Next<T>) => {
    ref.current = next instanceof Function ? next(ref.current) : next;
    setValue(ref.current);
  };

  return [value, set, ref];
}
