import { useState } from 'preact/hooks';
import { isLight } from '../../lib/color/color';
import type { AppInfo } from '../../lib/apps/types';
import { cx } from '../../lib/cx/cx';
import styles from './Tile.module.css';
import type { Props } from './types';

export function Tile({ app, index, focused, pressed, moving, titled }: Props) {
  // Keyed by the app object, so every refreshed list gives its icon another try.
  const [failed, setFailed] = useState<AppInfo | null>(null);

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
        {app.icon && failed !== app ? (
          <img
            class={cx(styles.icon, app.logo && styles.logo)}
            src={app.icon}
            alt=""
            onError={() => setFailed(app)}
          />
        ) : (
          <div class={cx(styles.fallback, isLight(app.color) && styles.onLight)}>{app.title}</div>
        )}
      </div>
      {titled && <div class={styles.title}>{app.title}</div>}
    </div>
  );
}
