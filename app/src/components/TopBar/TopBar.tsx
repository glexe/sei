import { cx } from '../../lib/cx/cx';
import { Clock } from '../Clock/Clock';
import { WeatherWidget } from '../WeatherWidget/WeatherWidget';
import styles from './TopBar.module.css';
import type { Props } from './types';

export function TopBar(props: Props) {
  const { weatherPlace, temperatureUnit, clockFormat, showWeekday, showDate, faded, hidden } =
    props;
  return (
    <header class={cx(styles.topBar, faded && styles.faded, hidden && styles.hidden)}>
      <WeatherWidget place={weatherPlace} unit={temperatureUnit} />
      <div class={styles.right}>
        <Clock format={clockFormat} showWeekday={showWeekday} showDate={showDate} />
      </div>
    </header>
  );
}
