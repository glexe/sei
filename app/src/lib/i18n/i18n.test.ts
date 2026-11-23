import { describe, expect, it } from 'vitest';
import { LANGUAGES } from '../languages/constants';
import { createI18n, uiLanguage } from './i18n';
import { LOCALES } from './constants';
import { en } from './locales/en';

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('dictionaries', () => {
  it('exist for every language', () => {
    expect(Object.keys(LOCALES).sort()).toEqual([...LANGUAGES].sort());
  });

  it('use the same placeholders as English in every message', () => {
    for (const [lang, locale] of Object.entries(LOCALES)) {
      for (const [group, messages] of Object.entries(en.messages)) {
        for (const [key, text] of Object.entries(messages)) {
          const translated = (locale.messages as Record<string, Record<string, string>>)[group][
            key
          ];
          expect(placeholders(translated), `${lang} ${group}.${key}`).toEqual(placeholders(text));
        }
      }
    }
  });
});

describe('i18n', () => {
  it('prefers the setting, then the TV language, then English', () => {
    expect(uiLanguage('de', 'ru')).toBe('de');
    expect(uiLanguage(null, 'ru')).toBe('ru');
    expect(uiLanguage(null, 'xx')).toBe('en');
  });

  it('fills placeholders and returns one instance per language', () => {
    const i18n = createI18n('en');
    expect(i18n.t('files.freeOf', { free: '1 GB', total: '2 GB' })).toBe('1 GB free of 2 GB');
    expect(createI18n('en')).toBe(i18n);
  });
});
