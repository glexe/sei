import type { RefObject } from 'preact';
import type { Tracks } from '../../../../lib/player/types';
import type { MenuItem } from '../../../../primitives/TrackMenu/types';

export type Menu = 'subtitles' | 'audio';

export interface TrackPrefs {
  audio: string | null;
  subtitle: string | null;
}

export interface TrackMenuState {
  tracks: Tracks;
  menu: Menu | null;
  menuRef: RefObject<Menu | null>;
  focus: number;
  setFocus: (next: number | ((current: number) => number)) => void;
  focusRef: RefObject<number>;
  items: (which: Menu) => MenuItem[];
  open: (which: Menu | null) => void;
  choose: (index: number) => void;
}
