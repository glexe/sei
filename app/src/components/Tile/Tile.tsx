import { useState } from 'preact/hooks';
import { isLight } from '../../lib/color/color';
import { cx } from '../../lib/cx/cx';
import styles from './Tile.module.css';
import type { Props } from './types';

export function Tile({ app, index, focused, pressed, moving, titled }: Props) {
  // Keyed by path so a refreshed icon gets another try.
  const [failedIcon, setFailedIcon] = useState('');

  return (
    <div
      class={cx(
        styles.tile,
        focused && styles.focused,
        pressed && styles.pressed,
        moving && styles.moving,
      )}
      data-index={index}
      style={app.color ? { '--tile-color': app.color } : undefined}
    >
      <div class={cx(styles.art, app.internal && styles.shaded)}>
        {app.icon && app.icon !== failedIcon ? (
          <img
            class={cx(styles.icon, app.logo && styles.logo)}
            src={app.icon}
            alt=""
            onError={() => setFailedIcon(app.icon)}
          />
        ) : (
          <div class={cx(styles.fallback, isLight(app.color) && styles.onLight)}>{app.title}</div>
        )}
      </div>
      {titled && <div class={styles.title}>{app.title}</div>}
    </div>
  );
}
