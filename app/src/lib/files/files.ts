import { lunaCall } from '../luna/luna';
import type { LunaResponse } from '../luna/types';
import type { Storage, FileEntry, FileKind, MediaType, PlayerFile } from './types';
import { SERVICE } from '../luna/constants';
import { KINDS, MEDIA_PLAYER_ID, SIZE_UNITS } from './constants';

export function kindOf(entry: FileEntry): FileKind {
  if (entry.dir) return 'folder';
  return KINDS.find(([, re]) => re.test(entry.name))?.[0] ?? 'file';
}

// Intl formatters are slow to build and a folder may list thousands of files, so build each one once.
const formatters = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function numberFormat(lang: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = lang + JSON.stringify(options);
  if (!formatters.has(key)) formatters.set(key, new Intl.NumberFormat(lang, options));
  return formatters.get(key) as Intl.NumberFormat;
}

export function formatSize(bytes: number, lang: string): string {
  let n = bytes;
  let i = 0;
  while (n >= 1000 && i < SIZE_UNITS.length - 1) {
    n /= 1000;
    i++;
  }
  return numberFormat(lang, {
    style: 'unit',
    unit: SIZE_UNITS[i],
    maximumFractionDigits: i > 0 && n < 10 ? 1 : 0,
  }).format(n);
}

// Rounded to minutes: "45 min", "1 hr 20 min" in the UI language.
export function formatDuration(seconds: number, lang: string): string {
  const total = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const unit = (n: number, name: string) =>
    numberFormat(lang, { style: 'unit', unit: name, unitDisplay: 'short' }).format(n);
  return [hours > 0 && unit(hours, 'hour'), (minutes > 0 || hours === 0) && unit(minutes, 'minute')]
    .filter(Boolean)
    .join(' ');
}

export function formatDate(ms: number, lang: string): string {
  const key = lang + ':date';
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', year: 'numeric' }),
    );
  }
  return (formatters.get(key) as Intl.DateTimeFormat).format(ms);
}

export async function listStorages(): Promise<Storage[]> {
  const res = await lunaCall<LunaResponse & { storages?: Storage[] }>(SERVICE + '/listStorages');
  return res.storages ?? [];
}

// `truncated`: the folder has more entries than the service lists (service MAX_ENTRIES).
export async function listDir(path: string): Promise<{ entries: FileEntry[]; truncated: boolean }> {
  const res = await lunaCall<LunaResponse & { entries?: FileEntry[]; truncated?: boolean }>(
    SERVICE + '/listDir',
    { path },
  );
  return { entries: res.entries ?? [], truncated: !!res.truncated };
}

// Undocumented deep link of LG Media Player, taken from its own launch-param handling.
export async function openInMediaPlayer(
  storageId: string,
  mediaType: MediaType,
  files: PlayerFile[],
  playIndex: number,
): Promise<void> {
  const payload = files.map((f, index) => ({
    mediaType,
    udn: storageId,
    deviceType: 'usb',
    fileName: f.name,
    fullPath: f.path,
    thumbnail: '',
    size: f.size,
    index,
  }));
  await lunaCall(SERVICE + '/launch', { id: MEDIA_PLAYER_ID, params: { payload, playIndex } });
}
