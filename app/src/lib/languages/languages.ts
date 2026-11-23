import { ALIASES } from './constants';

const namers = new Map<string, Intl.DisplayNames | null>();

function namer(lang: string): Intl.DisplayNames | null {
  if (!namers.has(lang)) {
    namers.set(
      lang,
      typeof Intl.DisplayNames === 'function'
        ? new Intl.DisplayNames([lang], { type: 'language' })
        : null,
    );
  }
  return namers.get(lang)!;
}

// Media files use ISO 639-2 ("eng", "ger"); Intl maps them to the two-letter codes we store.
export function normalizeLanguage(code: string | undefined): string | null {
  if (!code || code === 'und') return null;
  let primary: string;
  try {
    primary = Intl.getCanonicalLocales(code)[0].split('-')[0];
  } catch {
    primary = code.toLowerCase();
  }
  return ALIASES[primary] ?? primary;
}

// Name of `code` in language `lang`; languageName('ru', 'ru') is the name speakers use themselves.
export function languageName(code: string | null, lang = 'en'): string {
  if (!code) return '';
  let name: string;
  try {
    name = namer(lang)?.of(code) ?? code.toUpperCase();
  } catch {
    name = code.toUpperCase();
  }
  return name.charAt(0).toLocaleUpperCase(lang) + name.slice(1);
}
