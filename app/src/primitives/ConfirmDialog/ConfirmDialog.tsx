import { useRemote } from '../../hooks/useRemote/useRemote';
import { useStateRef } from '../../hooks/useStateRef/useStateRef';
import { cx } from '../../lib/cx/cx';
import { Key } from '../../lib/remote/constants';
import { isBack } from '../../lib/remote/remote';
import { Screen } from '../Screen/Screen';
import styles from './ConfirmDialog.module.css';
import type { Props } from './types';

// Full-screen question with two buttons, like tvOS alerts; a solid fill stands in for their blur.
export function ConfirmDialog(props: Props) {
  const { art, title, text, confirmLabel, cancelLabel, destructive, busy } = props;
  const { onConfirm, onCancel } = props;
  const [focus, setFocus, focusRef] = useStateRef(0);
  const choose = (i: number) => (i === 0 ? onConfirm() : onCancel());

  useRemote((e) => {
    const code = e.keyCode;
    if (busy) return true;
    if (code === Key.Up) setFocus(0);
    else if (code === Key.Down) setFocus(1);
    else if (code === Key.Ok) {
      if (!e.repeat) choose(focusRef.current);
    } else if (isBack(code)) onCancel();
    else return false;
    return true;
  });

  return (
    <Screen>
      <div class={styles.dialog} role="alertdialog" aria-label={title}>
        {art && <div class={styles.art}>{art}</div>}
        <h1 class={styles.title}>{title}</h1>
        <p class={styles.text}>{text}</p>
        <div class={styles.buttons}>
          {(busy ? [] : [confirmLabel, cancelLabel]).map((label, i) => (
            <button
              key={label}
              class={cx(
                styles.button,
                i === 0 && destructive && styles.destructive,
                i === focus && styles.focused,
              )}
              tabIndex={-1}
              onClick={() => choose(i)}
              onMouseMove={() => i !== focus && setFocus(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
