import { Pill } from '../../primitives/Pill/Pill';
import styles from './WeatherWidget.module.css';
import type { Props } from './types';
import { ICONS } from './constants';
import { useWeather } from './hooks';

export function WeatherWidget({ place, unit }: Props) {
  const weather = useWeather(place, unit);
  if (!weather) return null;
  const Icon = ICONS[weather.kind];
  return (
    <Pill>
      <Icon class={styles.icon} />
      <span>{weather.temperature}°</span>
    </Pill>
  );
}
