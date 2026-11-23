import type { AppInfo } from './types';

export const CACHE_KEY = 'launchPoints.v1';

// The order the viewer arranged with Move; until then config PINNED leads.
export const ORDER_KEY = 'appOrder.v1';

// Uninstalling a big app takes a while; the service itself gives up after two minutes.
export const REMOVE_TIMEOUT_MS = 130_000;

// LG's brand logos are drawn on white.
export const BRAND_COLOR = '#ffffff';

export const FILES_TILE: AppInfo = {
  id: 'launcher.files',
  title: 'Files',
  icon: 'img/files.svg',
  logo: true,
  color: '#3d7be0',
  params: {},
  removable: false,
  internal: 'files',
};

export const SETTINGS_TILE: AppInfo = {
  id: 'launcher.settings',
  title: 'Settings',
  icon: 'img/settings.svg',
  logo: true,
  color: '#7c7c84',
  params: {},
  removable: false,
  internal: 'settings',
};

export const INTERNAL_TILES: readonly AppInfo[] = [FILES_TILE, SETTINGS_TILE];
