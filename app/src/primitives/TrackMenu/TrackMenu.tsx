import { Check } from '../../icons/Check';
import { cx } from '../../lib/cx/cx';
import { Panel } from '../Panel/Panel';
import styles from './TrackMenu.module.css';
import type { Props } from './types';
import { VISIBLE_ITEMS } from './constants';

export function TrackMenu({ title, items, focus, onSelect, onHover }: Props) {
  const maxStart = Math.max(0, items.length - VISIBLE_ITEMS);
  const start = Math.min(maxStart, Math.max(0, focus - Math.floor(VISIBLE_ITEMS / 2)));
  return (
    <Panel>
      <div class={styles.menu} role="menu" aria-label={title}>
        <p class={styles.title}>{title}</p>
        <div class={styles.viewport}>
          <div class={styles.items} style={{ '--start': start }}>
            {items.map((item, i) => (
              <button
                key={item.label + i}
                class={cx(styles.item, i === focus && styles.focused)}
                role="menuitemradio"
                aria-checked={item.checked}
                tabIndex={-1}
                onClick={() => onSelect(i)}
                onMouseMove={() => i !== focus && onHover(i)}
              >
                <span class={styles.check}>
                  {item.checked && <Check class={styles.checkIcon} />}
                </span>
                <span class={styles.label}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
