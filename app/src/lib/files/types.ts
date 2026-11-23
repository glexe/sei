export interface Storage {
  id: string;
  name: string;
  path: string;
  total?: number;
  free?: number;
}

export interface FileEntry {
  name: string;
  dir: boolean;
  size: number;
  modified: number;
}

export type FileKind =
  | 'folder'
  | 'video'
  | 'audio'
  | 'image'
  | 'text'
  | 'archive'
  | 'code'
  | 'file';

export type MediaType = 'video' | 'image' | 'audio';

export interface PlayerFile {
  name: string;
  path: string;
  size: number;
}
