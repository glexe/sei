import styles from './Toast.module.css';
import type { Props } from './types';

export function Toast({ text }: Props) {
  return text ? <div class={styles.toast}>{text}</div> : null;
}
