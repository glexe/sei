import { useState } from 'preact/hooks';
import type { NavEntry, NavStack } from './types';

// Screens pushed on OK and popped on Back; each keeps its focused row for the way back.
export function useNavStack<S>(initial: S): NavStack<S> {
  const [stack, setStack] = useState<NavEntry<S>[]>([{ screen: initial, focus: null }]);
  const [wentBack, setWentBack] = useState(false);
  return {
    top: stack[stack.length - 1],
    depth: stack.length,
    wentBack,
    push: (screen) => {
      setWentBack(false);
      setStack((s) => [...s, { screen, focus: null }]);
    },
    pop: () => {
      setWentBack(true);
      setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    },
    setFocus: (focus) => setStack((s) => [...s.slice(0, -1), { ...s[s.length - 1], focus }]),
  };
}
