import { useEffect, useState } from 'preact/hooks';
import { createI18n, systemLanguage, uiLanguage } from '../../lib/i18n/i18n';
import type { I18n } from '../../lib/i18n/types';

// The chosen language, else the TV menu language, else English; follows the TV when its language changes.
export function useLanguage(setting: string | null): I18n {
  const [system, setSystem] = useState(systemLanguage);
  const lang = uiLanguage(setting, system);

  useEffect(() => {
    const onChange = () => setSystem(systemLanguage());
    document.addEventListener('webOSLocaleChange', onChange);
    return () => document.removeEventListener('webOSLocaleChange', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return createI18n(lang);
}
