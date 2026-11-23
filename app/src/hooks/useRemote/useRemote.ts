import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';

export function useRemote(
  handler: (e: KeyboardEvent) => boolean,
  enabled = true,
  type: 'keydown' | 'keyup' = 'keydown',
): void {
  const handlerRef = useRef(handler);
  // Writing a ref during render would make the React Compiler skip this hook.
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (handlerRef.current(e)) e.preventDefault();
    };
    document.addEventListener(type, onKey);
    return () => document.removeEventListener(type, onKey);
  }, [enabled, type]);
}
