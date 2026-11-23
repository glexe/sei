import { languageName, normalizeLanguage } from '../languages/languages';
import type { Wallpaper } from '../wallpapers/types';
import type { I18n, MessageKey, Messages, Params } from './types';
import { FALLBACK, LOCALES } from './constants';

// webOS keeps the TV menu language in webOSSystem.locale; navigator.language may lag behind it.
export function systemLanguage(): string | null {
  return normalizeLanguage((window.webOSSystem ?? window.PalmSystem)?.locale || navigator.language);
}

export function uiLanguage(setting: string | null, system: string | null): string {
  if (setting && LOCALES[setting]) return setting;
  if (system && LOCALES[system]) return system;
  return FALLBACK;
}

// One instance per language, so context consumers see the same object until the language changes.
const instances = new Map<string, I18n>();

export function createI18n(lang: string): I18n {
  const cached = instances.get(lang);
  if (cached) return cached;
  const locale = LOCALES[lang] ?? LOCALES[FALLBACK];
  const t = (key: MessageKey, params?: Params): string => {
    const [group, name] = key.split('.') as [keyof Messages, string];
    const text = (locale.messages[group] as Record<string, string>)[name];
    return params
      ? text.replace(/\{(\w+)\}/g, (m, name: string) => String(params[name] ?? m))
      : text;
  };
  const i18n: I18n = {
    lang,
    t,
    wallpaperTitle: (wallpaper: Wallpaper) => locale.wallpapers[wallpaper.id] ?? wallpaper.title,
    languageName: (code: string | null) => languageName(code, lang),
  };
  instances.set(lang, i18n);
  return i18n;
}
