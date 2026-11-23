import { useRemote } from '../../hooks/useRemote/useRemote';
import { useStateRef } from '../../hooks/useStateRef/useStateRef';
import { cx } from '../../lib/cx/cx';
import { Key } from '../../lib/remote/constants';
import { isBack } from '../../lib/remote/remote';
import { Panel } from '../Panel/Panel';
import styles from './ContextMenu.module.css';
import type { Props } from './types';

export function ContextMenu({ actions, onSelect, onClose }: Props) {
  const [focus, setFocus, focusRef] = useStateRef(0);

  useRemote((e) => {
    const code = e.keyCode;
    if (code === Key.Up) setFocus((i) => Math.max(i - 1, 0));
    else if (code === Key.Down) setFocus((i) => Math.min(i + 1, actions.length - 1));
    // The OK that opened the menu is still held and repeating.
    else if (code === Key.Ok) {
      if (!e.repeat) onSelect(focusRef.current);
    } else if (isBack(code) || code === Key.Left || code === Key.Right) onClose();
    else return false;
    return true;
  });

  return (
    <Panel>
      <div class={styles.menu} role="menu">
        {actions.map((action, i) => (
          <button
            key={action.label}
            class={cx(
              styles.item,
              action.destructive && styles.destructive,
              i === focus && styles.focused,
            )}
            role="menuitem"
            tabIndex={-1}
            onClick={() => onSelect(i)}
            onMouseMove={() => i !== focus && setFocus(i)}
          >
            {action.icon && <action.icon class={styles.icon} />}
            {action.label}
          </button>
        ))}
      </div>
    </Panel>
  );
}
