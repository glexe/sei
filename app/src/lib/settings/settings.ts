import { fetchState, saveState } from '../state/state';
import { readJson, isRecord, writeJson } from '../storage/storage';
import { DEFAULT_WALLPAPER, WALLPAPERS } from '../wallpapers/wallpapers';
import type { Settings } from './types';
import { DEFAULTS, KEY } from './constants';

// Stored settings over the defaults, so settings added later get their default value.
function normalize(stored: Partial<Settings>): Settings {
  const settings = { ...DEFAULTS, ...stored };
  if (!WALLPAPERS.some((w) => w.id === settings.wallpaper)) settings.wallpaper = DEFAULT_WALLPAPER;
  return settings;
}

// The localStorage copy is a cache for the first frame; restoreSettings brings the service's copy.
export const loadSettings = (): Settings => normalize(readJson(KEY, {}, isRecord));

export function saveSettings(settings: Settings): void {
  writeJson(KEY, settings);
  saveState({ settings });
}

// The service's copy, or null when it has none yet (then the cached settings seed it).
export async function restoreSettings(): Promise<Settings | null> {
  const state = await fetchState();
  // An unreadable state must not be replaced with whatever this cache holds.
  if (!state) return null;
  if (!isRecord(state.settings)) {
    saveState({ settings: loadSettings() });
    return null;
  }
  const settings = normalize(state.settings);
  writeJson(KEY, settings);
  return settings;
}
