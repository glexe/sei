import { cx } from '../../lib/cx/cx';
import { findWallpaper } from '../../lib/wallpapers/wallpapers';
import { Wallpaper } from '../Wallpaper/Wallpaper';
import styles from './Hero.module.css';
import type { Props } from './types';

export function Hero({ wallpaper, dimmed, hidden }: Props) {
  const current = findWallpaper(wallpaper);
  return (
    <div class={cx(styles.hero, dimmed && styles.dimmed, hidden && styles.hidden)}>
      <Wallpaper wallpaper={current} fill />
      <div class={cx(styles.shade, current.kind === 'pictures' && styles.vignette)} />
    </div>
  );
}
