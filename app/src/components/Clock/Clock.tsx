import { useI18n } from '../../hooks/useI18n/useI18n';
import { Pill } from '../../primitives/Pill/Pill';
import styles from './Clock.module.css';
import type { Props } from './types';
import { useClock } from './hooks';

export function Clock({ format, showWeekday, showDate }: Props) {
  const { lang } = useI18n();
  const { time, weekday, date } = useClock(format, lang);
  const day = [showWeekday && weekday, showDate && date].filter(Boolean).join(' ');
  return (
    <Pill>
      {day && <span class={styles.date}>{day}</span>}
      <span>{time}</span>
    </Pill>
  );
}
