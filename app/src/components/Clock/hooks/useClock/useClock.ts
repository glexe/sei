import { useEffect, useState } from 'preact/hooks';
import type { ClockFormat } from '../../../../lib/settings/types';
import type { ClockText } from './types';

const formatTime = (d: Date, clock: ClockFormat, lang: string): string =>
  d.toLocaleTimeString(lang, {
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: clock === '24h' ? 'h23' : 'h12',
  });

const capitalize = (text: string, lang: string): string =>
  text.charAt(0).toLocaleUpperCase(lang) + text.slice(1);

// Weekday and date are formatted apart, so they can be shown on their own and without a comma between them.
function read(clock: ClockFormat, lang: string): ClockText {
  const now = new Date();
  return {
    time: formatTime(now, clock, lang),
    weekday: capitalize(now.toLocaleDateString(lang, { weekday: 'short' }), lang),
    date: now.toLocaleDateString(lang, { day: 'numeric', month: 'short' }),
  };
}

// All parts refresh together, so the date flips at midnight with the clock.
export function useClock(clock: ClockFormat, lang: string): ClockText {
  const [value, setValue] = useState(() => read(clock, lang));
  useEffect(() => {
    const tick = () => setValue(read(clock, lang));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [clock, lang]);
  return value;
}
