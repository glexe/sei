import { useLayoutEffect, useRef } from 'preact/hooks';
import { useRemote } from '../../../../hooks/useRemote/useRemote';
import { Key } from '../../../../lib/remote/constants';

// OK acts on release: a short press calls onPress, holding it HOLD_MS calls onHold instead.
export function useOkHold(holdMs: number, onPress: () => void, onHold: () => boolean): () => void {
  const holdRef = useRef<{ timer: number; held: boolean } | null>(null);
  const actionsRef = useRef({ onPress, onHold });
  useLayoutEffect(() => {
    actionsRef.current = { onPress, onHold };
  });

  useRemote(
    (e) => {
      if (e.keyCode !== Key.Ok || !holdRef.current) return false;
      clearTimeout(holdRef.current.timer);
      if (!holdRef.current.held) actionsRef.current.onPress();
      holdRef.current = null;
      return true;
    },
    true,
    'keyup',
  );

  // Call on the first OK keydown; onHold returns false when there is nothing to show, so release still presses.
  return () => {
    if (holdRef.current) clearTimeout(holdRef.current.timer);
    const state = { held: false, timer: 0 };
    state.timer = window.setTimeout(() => {
      state.held = actionsRef.current.onHold();
    }, holdMs);
    holdRef.current = state;
  };
}
