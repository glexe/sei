import { SERVICE } from '../luna/constants';
import { lunaCall } from '../luna/luna';
import type { LunaResponse } from '../luna/types';
import { isRecord } from '../storage/storage';
import type { Drive, Playback, Positions } from './types';
import { EDGE_S, FINISHED_RATIO, FLUSH_MS, MAX_FILES } from './constants';

// History of each drive by its mount point; keys inside are paths within the drive ("/Shows/1.mkv").
const drives = new Map<string, Drive>();

// The drive's position for `rel` after a save, or null when the save is ignored.
export function withSaved(
  positions: Positions,
  rel: string,
  time: number,
  duration: number,
): Positions | null {
  // A closing or just-opened video reports 0, so early times never overwrite a saved position.
  if (time < EDGE_S) return null;
  const finished = duration > 0 && (time > duration * FINISHED_RATIO || duration - time < EDGE_S);
  const watched = finished || positions[rel]?.watched;
  const next: Positions = {
    ...positions,
    [rel]: { time: finished ? 0 : time, duration, at: Date.now(), ...(watched && { watched }) },
  };
  const entries = Object.entries(next);
  if (entries.length <= MAX_FILES) return next;
  return Object.fromEntries(entries.sort(([, a], [, b]) => b.at - a.at).slice(0, MAX_FILES));
}

export function playbackOf(positions: Positions): Map<string, Playback> {
  const states = new Map<string, Playback>();
  for (const [rel, { time, duration, watched }] of Object.entries(positions)) {
    const partWay = time > 0 && !!duration;
    states.set(rel, {
      watched: !!watched,
      ...(partWay && { progress: time / duration, remaining: duration - time }),
    });
  }
  return states;
}

// Reads the drive's history file once; a drive that can't be read starts empty.
export async function openDrive(root: string): Promise<void> {
  if (drives.has(root)) return;
  const res = await lunaCall<LunaResponse & { history?: unknown }>(SERVICE + '/readHistory', {
    root,
  }).catch(() => ({ history: {} }));
  if (drives.has(root)) return;
  const positions = isRecord(res.history) ? (res.history as Positions) : {};
  drives.set(root, { positions, dirty: false, flushedAt: Date.now() });
}

export const resumeTime = (root: string, rel: string): number =>
  drives.get(root)?.positions[rel]?.time ?? 0;

export const playbackStates = (root: string): Map<string, Playback> =>
  playbackOf(drives.get(root)?.positions ?? {});

// Writes the drive's file when something changed; a read-only or pulled drive keeps the history in memory.
export function flushDrive(root: string): void {
  const drive = drives.get(root);
  if (!drive?.dirty) return;
  drive.dirty = false;
  drive.flushedAt = Date.now();
  lunaCall(SERVICE + '/writeHistory', { root, history: drive.positions }).catch(() => {
    drive.dirty = true;
  });
}

export function saveTime(root: string, rel: string, time: number, duration: number): void {
  const drive = drives.get(root);
  const next = drive && withSaved(drive.positions, rel, time, duration);
  if (!drive || !next) return;
  drive.positions = next;
  drive.dirty = true;
  if (Date.now() - drive.flushedAt >= FLUSH_MS) flushDrive(root);
}
