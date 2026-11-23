import type { FileKind } from './types';

export const KINDS: [FileKind, RegExp][] = [
  ['video', /\.(mkv|mp4|m4v|avi|mov|wmv|webm|ts|m2ts|mpg|mpeg)$/i],
  ['audio', /\.(mp3|flac|wav|aac|m4a|ogg|opus|wma|alac)$/i],
  ['image', /\.(jpe?g|png|gif|webp|heic|bmp|tiff?)$/i],
  ['text', /\.(txt|md|srt|ass|nfo|log|pdf)$/i],
  ['archive', /\.(zip|rar|7z|tar|gz|ipk)$/i],
  ['code', /\.(sh|js|json|py|html|css)$/i],
];

// Intl unit names, so sizes read naturally in every UI language.
export const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'];

export const MEDIA_PLAYER_ID = 'com.webos.app.mediadiscovery';
