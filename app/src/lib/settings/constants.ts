import { DEFAULT_WALLPAPER } from '../wallpapers/wallpapers';
import type { Settings } from './types';

export const KEY = 'settings.v1';

export const DEFAULTS: Settings = {
  language: null,
  wallpaper: DEFAULT_WALLPAPER,
  weatherEnabled: true,
  weatherPlace: null,
  temperatureUnit: 'celsius',
  clockFormat: '24h',
  showWeekday: false,
  showDate: false,
  audioLanguage: null,
  subtitleLanguage: null,
};
