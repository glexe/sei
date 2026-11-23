import type { FileKind } from '../../lib/files/types';
import type { RowData } from '../../primitives/Row/types';

export interface Level {
  path: string | null;
  storageId?: string;
  // Mount point of the drive; its history file lives there (lib/resume).
  root?: string;
  title: string;
}

export interface Item extends RowData {
  path?: string;
  storageId?: string;
  dir: boolean;
  kind?: FileKind;
  size?: number;
  // Size and date; the preview adds the playback state in front.
  caption: string;
  progress?: number;
  remaining?: number;
  // Videos only: path inside the drive, the key of their saved position and watched mark.
  rel?: string;
}

export type Load =
  | { state: 'loading' }
  | { state: 'error'; text: string }
  // truncated: the service listed only the first entries of a huge folder.
  | { state: 'done'; items: Item[]; truncated: boolean };

// What was loaded and for which folder (undefined: nothing yet).
export interface Loaded {
  path: string | null | undefined;
  load: Load;
}

export interface Props {
  audioLanguage: string | null;
  subtitleLanguage: string | null;
  onClose: () => void;
  onError: (text: string) => void;
}
