import styles from './Pill.module.css';
import type { Props } from './types';

export function Pill({ children }: Props) {
  return <div class={styles.pill}>{children}</div>;
}
