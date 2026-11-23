import { cx } from '../../lib/cx/cx';
import styles from './Screen.module.css';
import type { Props } from './types';

export function Screen({ children, back }: Props) {
  return <section class={cx(styles.screen, back && styles.back)}>{children}</section>;
}
