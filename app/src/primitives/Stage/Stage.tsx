import styles from './Stage.module.css';
import type { Props } from './types';

// The fixed 1920×1080 area everything is laid out in.
export function Stage({ children }: Props) {
  return <div class={styles.stage}>{children}</div>;
}
