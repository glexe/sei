import { useLayoutEffect, useRef } from 'preact/hooks';
import { useRemote } from '../../hooks/useRemote/useRemote';
import { indexFromEvent } from '../../lib/dom/dom';
import { isBack } from '../../lib/remote/remote';
import { Key } from '../../lib/remote/constants';
import { Enter } from '../Enter/Enter';
import { Row } from '../Row/Row';
import type { RowData } from '../Row/types';
import styles from './List.module.css';
import type { Props } from './types';
import { BUFFER, VISIBLE_ROWS } from './constants';

export function List<R extends RowData>(props: Props<R>) {
  const { section, rows, onFocus, onSelect, onBack } = props;
  const last = rows.length - 1;
  const focus = Math.max(0, Math.min(props.focus, last));
  // Held keys outrun re-renders, so steps count from this ref, not from the prop.
  const focusRef = useRef(focus);
  useLayoutEffect(() => {
    focusRef.current = focus;
  });
  const current = () => Math.min(focusRef.current, last);

  const focusRow = (i: number) => {
    focusRef.current = i;
    onFocus(i);
  };

  useRemote((e) => {
    const code = e.keyCode;
    if (code === Key.Up) focusRow(Math.max(0, current() - 1));
    else if (code === Key.Down) focusRow(Math.min(last, current() + 1));
    else if (code === Key.Ok) onSelect(rows[current()], current());
    else if (isBack(code)) onBack();
    else return false;
    return true;
  });

  const maxStart = Math.max(0, rows.length - VISIBLE_ROWS);
  const start = Math.min(maxStart, Math.max(0, focus - Math.floor(VISIBLE_ROWS / 2)));
  const from = Math.max(0, start - BUFFER);
  const to = Math.min(rows.length, start + VISIBLE_ROWS + BUFFER);

  return (
    <Enter>
      {section && <h2 class={styles.section}>{section}</h2>}
      <div class={styles.viewport}>
        <ul
          class={styles.rows}
          style={{ '--start': start }}
          onMouseMove={(e) => {
            const i = indexFromEvent(e);
            if (i !== null && i !== focus) focusRow(i);
          }}
          onClick={(e) => {
            const i = indexFromEvent(e);
            if (i !== null) onSelect(rows[i], i);
          }}
        >
          {rows.slice(from, to).map((row, k) => (
            <Row key={row.id} {...row} index={from + k} focused={from + k === focus} placed />
          ))}
        </ul>
      </div>
    </Enter>
  );
}
