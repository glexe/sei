import { useI18n } from '../../hooks/useI18n/useI18n';
import { cx } from '../../lib/cx/cx';
import { indexFromEvent } from '../../lib/dom/dom';
import { colOf, rowOf } from '../../lib/gridNav/gridNav';
import { Tile } from '../Tile/Tile';
import styles from './AppGrid.module.css';
import type { Props } from './types';

export function AppGrid(props: Props) {
  const { apps, focus, row, pressed, moving, hidden, menuIndex, menu } = props;
  const { onPointerFocus, onPointerActivate } = props;
  const { t } = useI18n();

  // Fixed DOM order: reinserting a node cancels its transition, so a move only changes --col and --row.
  const slots = apps.map((app, i) => ({ app, i })).sort((a, b) => (a.app.id < b.app.id ? -1 : 1));

  // mousemove, not mouseover: tiles scrolling under a resting cursor must not steal focus.
  const onMouseMove = (e: MouseEvent) => {
    const i = indexFromEvent(e);
    if (i !== null && i !== focus) onPointerFocus(i);
  };
  const onClick = (e: MouseEvent) => {
    const i = indexFromEvent(e);
    if (i !== null) onPointerActivate(i);
  };

  return (
    <main
      class={cx(styles.home, row > 0 && styles.scrolled, hidden && styles.hidden)}
      style={{ '--scroll-row': row }}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      {slots.map(({ app, i }) => {
        const docked = rowOf(i) === 0;
        return (
          <div
            key={app.id}
            class={cx(
              styles.slot,
              !docked && styles.belowDock,
              (i === focus || i === menuIndex) && styles.raised,
            )}
            style={{ '--col': colOf(i), '--row': rowOf(i) }}
          >
            {i === menuIndex && (
              <div class={cx(styles.menu, docked ? styles.above : styles.below)}>{menu}</div>
            )}
            <Tile
              app={app.internal ? { ...app, title: t(`${app.internal}.title`) } : app}
              index={i}
              focused={i === focus}
              pressed={i === pressed}
              moving={i === moving}
              titled={!docked}
            />
          </div>
        );
      })}
    </main>
  );
}
