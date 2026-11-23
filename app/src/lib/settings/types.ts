import type { Place, TemperatureUnit } from '../weather/types';

export interface Settings {
  // Two-letter code; null follows the TV menu language.
  language: string | null;
  wallpaper: string;
  // Off keeps the place, so turning weather back on needs no new search.
  weatherEnabled: boolean;
  weatherPlace: Place | null;
  temperatureUnit: TemperatureUnit;
  clockFormat: ClockFormat;
  showWeekday: boolean;
  showDate: boolean;
  // Two-letter codes; null plays the file's default audio and leaves subtitles off.
  audioLanguage: string | null;
  subtitleLanguage: string | null;
}

export type ClockFormat = '24h' | '12h';
