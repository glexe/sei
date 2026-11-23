import { File } from '../../icons/File';
import { FileAudio } from '../../icons/FileAudio';
import { FileCode } from '../../icons/FileCode';
import { FileImage } from '../../icons/FileImage';
import { FileText } from '../../icons/FileText';
import { FileVideo } from '../../icons/FileVideo';
import { FileZip } from '../../icons/FileZip';
import { Folder } from '../../icons/Folder';
import type { Load } from './types';
import type { MediaType, FileKind } from '../../lib/files/types';
import type { ComponentType } from 'preact';
import type { IconProps } from '../../icons/types';

export const LOADING: Load = { state: 'loading' };

export const ICONS: Record<FileKind, ComponentType<IconProps>> = {
  folder: Folder,
  video: FileVideo,
  audio: FileAudio,
  image: FileImage,
  text: FileText,
  archive: FileZip,
  code: FileCode,
  file: File,
};

export const PLAYABLE: Partial<Record<FileKind, MediaType>> = {
  video: 'video',
  image: 'image',
  audio: 'audio',
};
