import styles from './Panel.module.css';
import type { Props } from './types';

export function Panel({ children }: Props) {
  return <div class={styles.panel}>{children}</div>;
}
