import type { Locale } from './types';
import { be } from './locales/be';
import { cs } from './locales/cs';
import { da } from './locales/da';
import { de } from './locales/de';
import { el } from './locales/el';
import { en } from './locales/en';
import { es } from './locales/es';
import { fi } from './locales/fi';
import { fr } from './locales/fr';
import { hi } from './locales/hi';
import { hu } from './locales/hu';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { kk } from './locales/kk';
import { ko } from './locales/ko';
import { nl } from './locales/nl';
import { no } from './locales/no';
import { pl } from './locales/pl';
import { pt } from './locales/pt';
import { ro } from './locales/ro';
import { ru } from './locales/ru';
import { sv } from './locales/sv';
import { th } from './locales/th';
import { tr } from './locales/tr';
import { uk } from './locales/uk';
import { zh } from './locales/zh';

export const FALLBACK = 'en';

// One dictionary per language in lib/languages LANGUAGES.
export const LOCALES: Record<string, Locale> = {
  be,
  cs,
  da,
  de,
  el,
  en,
  es,
  fi,
  fr,
  hi,
  hu,
  it,
  ja,
  kk,
  ko,
  nl,
  no,
  pl,
  pt,
  ro,
  ru,
  sv,
  th,
  tr,
  uk,
  zh,
};
