import { SERVICE } from '../luna/constants';
import { lunaCall } from '../luna/luna';
import type { LunaResponse } from '../luna/types';
import { isRecord } from '../storage/storage';
import type { PersistedState } from './types';

// webOS can wipe every app's localStorage when an app is uninstalled, so the service keeps the real copy.
let current: PersistedState = {};
let loading: Promise<PersistedState | null> | null = null;
let writing: Promise<unknown> = Promise.resolve();

// One read per launcher start, shared by every caller; null when the service couldn't read it.
export function fetchState(): Promise<PersistedState | null> {
  loading ??= lunaCall<LunaResponse & { state?: unknown }>(SERVICE + '/getState')
    .then((res) => {
      const state = isRecord(res.state) ? (res.state as PersistedState) : {};
      current = { ...state, ...current };
      return current;
    })
    .catch(() => null);
  return loading;
}

// Writes go out one at a time and always carry the whole state, so the last one wins.
export function saveState(patch: PersistedState): void {
  current = { ...current, ...patch };
  const state = current;
  writing = writing.then(() => lunaCall(SERVICE + '/setState', { state })).catch(() => {});
}
