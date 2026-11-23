import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import type { RefObject } from 'preact';
import { useStateRef } from '../../../../hooks/useStateRef/useStateRef';

// Shown on poke(), hidden again after `ms` unless canHide() says no at that moment.
export function useAutoHide(
  ms: number,
  canHide: () => boolean,
): [boolean, () => void, (on: boolean) => void, RefObject<boolean>] {
  const [visible, setVisible, visibleRef] = useStateRef(true);
  const timerRef = useRef(0);
  const checkRef = useRef(canHide);
  useLayoutEffect(() => {
    checkRef.current = canHide;
  });

  const poke = () => {
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => checkRef.current() && setVisible(false), ms);
  };

  useEffect(() => {
    poke();
    return () => clearTimeout(timerRef.current);
  }, []);

  return [visible, poke, setVisible, visibleRef];
}
