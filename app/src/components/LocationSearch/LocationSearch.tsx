import { useEffect, useRef, useState } from 'preact/hooks';
import { useI18n } from '../../hooks/useI18n/useI18n';
import { useStateRef } from '../../hooks/useStateRef/useStateRef';
import { useRemote } from '../../hooks/useRemote/useRemote';
import { MagnifyingGlass } from '../../icons/MagnifyingGlass';
import { MapPin } from '../../icons/MapPin';
import { cx } from '../../lib/cx/cx';
import { indexFromEvent } from '../../lib/dom/dom';
import { isBack } from '../../lib/remote/remote';
import { Key } from '../../lib/remote/constants';
import { searchPlaces } from '../../lib/weather/weather';
import type { Place } from '../../lib/weather/types';
import { Enter } from '../../primitives/Enter/Enter';
import { IconPreview } from '../../primitives/IconPreview/IconPreview';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { Row } from '../../primitives/Row/Row';
import styles from './LocationSearch.module.css';
import type { Props, Status } from './types';
import { INPUT, DEBOUNCE_MS, STATUS_TEXT } from './constants';

export function LocationSearch({ current, onSelect, onBack }: Props) {
  const { t, lang } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [editing, setEditing] = useState(false);
  const [focus, setFocus, focusRef] = useStateRef(INPUT);
  const requestIdRef = useRef(0);

  const search = (text: string) => {
    const q = text.trim();
    const id = ++requestIdRef.current;
    if (q.length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    searchPlaces(q, lang)
      .then((places) => {
        if (id !== requestIdRef.current) return;
        setResults(places);
        setStatus(places.length ? 'done' : 'empty');
      })
      .catch(() => id === requestIdRef.current && setStatus('error'));
  };

  useEffect(() => {
    const t = setTimeout(() => search(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (focus >= results.length && focus !== INPUT) setFocus(INPUT);
  }, [results, focus, setFocus]);

  useRemote((e) => {
    const code = e.keyCode;

    // While typing, only Down/Enter/Back leave the field; everything else goes to the input.
    if (document.activeElement === inputRef.current) {
      if (code === Key.Ok) search(query);
      if (code === Key.Ok || code === Key.Back || code === Key.Down) {
        inputRef.current?.blur();
        if (code === Key.Down && results.length) setFocus(0);
        return true;
      }
      return false;
    }

    const i = focusRef.current;
    if (code === Key.Up) setFocus(i <= 0 ? INPUT : i - 1);
    else if (code === Key.Down) setFocus(Math.min(results.length - 1, i + 1));
    else if (code === Key.Ok) {
      if (i === INPUT) inputRef.current?.focus();
      else if (results[i]) onSelect(results[i]);
    } else if (isBack(code)) onBack();
    else return false;
    return true;
  });

  return (
    <ListScreen
      title={t('weather.location')}
      preview={<IconPreview icon={MapPin} />}
      caption={
        current
          ? t('location.current', { place: `${current.name}, ${current.region}` })
          : t('location.none')
      }
    >
      <Enter>
        <label
          class={cx(styles.field, focus === INPUT && styles.focused, editing && styles.editing)}
        >
          <MagnifyingGlass class={styles.icon} />
          <input
            ref={inputRef}
            class={styles.input}
            type="text"
            value={query}
            placeholder={t('location.search')}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            onFocus={() => {
              setEditing(true);
              setFocus(INPUT);
            }}
            onBlur={() => setEditing(false)}
          />
        </label>

        {status !== 'done' && <p class={styles.status}>{t(STATUS_TEXT[status])}</p>}

        <ul
          class={styles.results}
          onClick={(e) => {
            const i = indexFromEvent(e);
            if (i !== null) onSelect(results[i]);
          }}
        >
          {results.map((place, i) => (
            <Row
              key={place.id}
              id={String(place.id)}
              index={i}
              label={place.name}
              value={place.region}
              checked={place.id === current?.id}
              focused={i === focus}
            />
          ))}
        </ul>
      </Enter>
    </ListScreen>
  );
}
