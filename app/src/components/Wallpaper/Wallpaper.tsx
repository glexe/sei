import { cx } from '../../lib/cx/cx';
import styles from './Wallpaper.module.css';
import type { Props } from './types';

export function Wallpaper({ wallpaper, thumb, fill }: Props) {
  const cls = cx(styles.wallpaper, fill && styles.fill);
  if (wallpaper.kind !== 'pictures') {
    return <div class={cx(cls, styles.painted, styles[wallpaper.id])} />;
  }
  return <img class={cls} src={thumb ? wallpaper.thumb : wallpaper.src} alt="" decoding="async" />;
}
