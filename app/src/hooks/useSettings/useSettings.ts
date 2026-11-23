import { useEffect, useState } from 'preact/hooks';
import { loadSettings, restoreSettings, saveSettings } from '../../lib/settings/settings';
import type { Settings } from '../../lib/settings/types';

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    void restoreSettings().then((stored) => stored && setSettings(stored));
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  };

  return [settings, update];
}
