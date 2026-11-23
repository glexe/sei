import { cx } from '../../lib/cx/cx';
import styles from './Switch.module.css';
import type { Props } from './types';

// Display only: the row around it handles OK and the pointer.
export function Switch({ on, label }: Props) {
  return (
    <span
      class={cx(styles.switch, on && styles.on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
    >
      <span class={styles.fill} />
      <span class={styles.knob} />
    </span>
  );
}
