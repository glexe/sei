import type { Wallpaper } from '../wallpapers/types';
import type { en } from './locales/en';

type English = typeof en.messages;

// Messages are grouped by screen; a key is "group.name", e.g. "player.back10".
export type Messages = { [G in keyof English]: Record<keyof English[G], string> };

export type MessageKey = {
  [G in keyof English]: `${G & string}.${keyof English[G] & string}`;
}[keyof English];

export interface Locale {
  messages: Messages;
  // By wallpaper id; a missing one falls back to the English title.
  wallpapers: Partial<Record<string, string>>;
}

export type Params = Record<string, string | number>;

export interface I18n {
  lang: string;
  t: (key: MessageKey, params?: Params) => string;
  wallpaperTitle: (wallpaper: Wallpaper) => string;
  languageName: (code: string | null) => string;
}
