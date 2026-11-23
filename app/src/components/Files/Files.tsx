import { useEffect, useState } from 'preact/hooks';
import { useI18n } from '../../hooks/useI18n/useI18n';
import { useNavStack } from '../../hooks/useNavStack/useNavStack';
import { useRemote } from '../../hooks/useRemote/useRemote';
import { Folder } from '../../icons/Folder';
import { HardDrive } from '../../icons/HardDrive';
import {
  formatDate,
  formatDuration,
  formatSize,
  kindOf,
  listDir,
  listStorages,
  openInMediaPlayer,
} from '../../lib/files/files';
import type { FileEntry, Storage } from '../../lib/files/types';
import type { I18n } from '../../lib/i18n/types';
import { openDrive, playbackStates } from '../../lib/resume/resume';
import type { Playback } from '../../lib/resume/types';
import { errorText } from '../../lib/luna/luna';
import { isBack } from '../../lib/remote/remote';
import { IconPreview } from '../../primitives/IconPreview/IconPreview';
import { Player } from '../Player/Player';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { Screen } from '../../primitives/Screen/Screen';
import { List } from '../../primitives/List/List';
import type { Level, Item, Load, Loaded, Props } from './types';
import { ICONS, LOADING, PLAYABLE } from './constants';

function storageItem(s: Storage, { t, lang }: I18n): Item {
  const space =
    s.total && s.free !== undefined
      ? t('files.freeOf', { free: formatSize(s.free, lang), total: formatSize(s.total, lang) })
      : '';
  return {
    id: s.id,
    label: s.name,
    icon: HardDrive,
    chevron: true,
    path: s.path,
    storageId: s.id,
    dir: true,
    caption: space,
  };
}

// Watched mark and progress of videos, from the player's saved positions.
function withPlayback(item: Item, states: Map<string, Playback>): Item {
  const state = item.rel ? states.get(item.rel) : undefined;
  return {
    ...item,
    dimmed: !!state?.watched,
    progress: state?.progress,
    remaining: state?.remaining,
  };
}

function entryItem(parent: string, e: FileEntry, level: Level, { t, lang }: I18n): Item {
  const kind = kindOf(e);
  const path = `${parent}/${e.name}`;
  return {
    kind,
    size: e.size,
    id: e.name,
    label: e.name,
    icon: ICONS[kind],
    value: e.dir ? undefined : formatSize(e.size, lang),
    chevron: e.dir,
    path,
    rel: kind === 'video' && level.root ? path.slice(level.root.length) : undefined,
    dir: e.dir,
    caption: `${e.dir ? t('files.folder') : formatSize(e.size, lang)} · ${formatDate(e.modified, lang)}`,
  };
}

function captionOf(load: Load, focused: Item | null, empty: string, i18n: I18n): string {
  const { t, lang } = i18n;
  if (load.state === 'loading') return t('files.loading');
  if (load.state === 'error') return t('files.cantOpen', { error: load.text });
  if (load.items.length === 0) return empty;
  if (!focused) return '';
  if (focused.remaining !== undefined)
    return `${t('files.left', { time: formatDuration(focused.remaining, lang) })} · ${focused.caption}`;
  if (focused.dimmed) return `${t('files.watched')} · ${focused.caption}`;
  return focused.caption;
}

export function Files({ audioLanguage, subtitleLanguage, onClose, onError }: Props) {
  const i18n = useI18n();
  const { t } = i18n;
  const nav = useNavStack<Level>({ path: null, title: '' });
  const level = nav.top.screen;
  const [loaded, setLoaded] = useState<Loaded>({ path: undefined, load: LOADING });
  // Until the new folder arrives, the previous one's list must not show under its title.
  const load = loaded.path === level.path ? loaded.load : LOADING;
  const [playing, setPlaying] = useState<Item | null>(null);

  useEffect(() => {
    let alive = true;
    const done = (next: Load) => alive && setLoaded({ path: level.path, load: next });
    const request = level.path
      ? listDir(level.path).then(async ({ entries, truncated }) => {
          const items = entries.map((e) => entryItem(level.path!, e, level, i18n));
          if (!level.root) return { items, truncated };
          await openDrive(level.root);
          const states = playbackStates(level.root);
          return { items: items.map((i) => withPlayback(i, states)), truncated };
        })
      : listStorages().then((storages) => ({
          items: storages.map((s) => storageItem(s, i18n)),
          truncated: false,
        }));
    request
      .then(({ items, truncated }) => done({ state: 'done', items, truncated }))
      .catch((err: unknown) => done({ state: 'error', text: errorText(err) }));
    return () => {
      alive = false;
    };
  }, [level.path, i18n]);

  const back = () => (nav.depth === 1 ? onClose() : nav.pop());

  const open = (item: Item) => {
    if (!item.path) return;
    if (!item.dir) {
      if (item.kind === 'video') setPlaying(item);
      else playInMediaPlayer(item);
      return;
    }
    nav.push({
      path: item.path,
      storageId: item.storageId ?? level.storageId,
      root: item.storageId ? item.path : level.root,
      title: item.label,
    });
  };

  // Siblings of the same kind become the player's playlist, starting at the chosen file.
  const playInMediaPlayer = (item: Item) => {
    const media = item.kind && PLAYABLE[item.kind];
    if (!media || !level.storageId || load.state !== 'done') return;
    const siblings = load.items.filter((i) => i.kind === item.kind);
    openInMediaPlayer(
      level.storageId,
      media,
      siblings.map((i) => ({ name: i.label, path: i.path!, size: i.size ?? 0 })),
      siblings.indexOf(item),
    ).catch((err: unknown) =>
      onError(t('home.cantOpen', { name: item.label, error: errorText(err) })),
    );
  };

  // The player changed a position or a watched mark; refresh them without reloading the folder.
  const refreshPlayback = () => {
    if (!level.root) return;
    const states = playbackStates(level.root);
    setLoaded(({ path, load: l }) => ({
      path,
      load: l.state === 'done' ? { ...l, items: l.items.map((i) => withPlayback(i, states)) } : l,
    }));
  };

  // While loading or on errors the list isn't mounted, so Back is handled here.
  useRemote(
    (e) => {
      if (!isBack(e.keyCode)) return false;
      back();
      return true;
    },
    load.state !== 'done' || load.items.length === 0,
  );

  if (playing) {
    return (
      <Player
        name={playing.label}
        path={playing.path!}
        root={level.root ?? ''}
        rel={playing.rel ?? null}
        audioLanguage={audioLanguage}
        subtitleLanguage={subtitleLanguage}
        onClose={() => {
          setPlaying(null);
          refreshPlayback();
        }}
      />
    );
  }

  const items = load.state === 'done' ? load.items : [];
  const focus = Math.min(nav.top.focus ?? 0, Math.max(items.length - 1, 0));
  const current = items[focus] ?? null;
  const empty = level.path ? t('files.empty') : t('files.connectUsb');

  return (
    <Screen back={nav.wentBack}>
      <ListScreen
        key={level.path ?? 'root'}
        title={
          level.path
            ? `${level.title}${load.state === 'done' && load.truncated ? ` · ${items.length}+` : ''}`
            : t('files.title')
        }
        preview={
          <IconPreview
            icon={(items.length && current?.icon) || Folder}
            dimmed={current?.dimmed}
            progress={current?.progress}
          />
        }
        caption={captionOf(load, current, empty, i18n)}
      >
        {items.length > 0 && (
          <List rows={items} focus={focus} onFocus={nav.setFocus} onSelect={open} onBack={back} />
        )}
      </ListScreen>
    </Screen>
  );
}
