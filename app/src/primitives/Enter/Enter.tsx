import styles from './Enter.module.css';
import type { Props } from './types';

// Slides its content in from the side the Screen around it says.
export function Enter({ children }: Props) {
  return <div class={styles.enter}>{children}</div>;
}
