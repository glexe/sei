import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { createI18n } from '../../lib/i18n/i18n';
import { FALLBACK } from '../../lib/i18n/constants';
import type { I18n } from '../../lib/i18n/types';

// App provides the current language; components re-render when it changes.
export const I18nContext = createContext<I18n>(createI18n(FALLBACK));

export const useI18n = (): I18n => useContext(I18nContext);
