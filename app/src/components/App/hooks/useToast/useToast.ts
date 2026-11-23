import { useEffect, useRef, useState } from 'preact/hooks';

export function useToast(duration = 4000): [string | null, (text: string) => void] {
  const [text, setText] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = (t: string) => {
    setText(t);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setText(null), duration);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);
  return [text, show];
}
