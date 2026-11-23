import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { cachedApps, loadApps } from '../../../../lib/apps/apps';
import type { AppInfo } from '../../../../lib/apps/types';
import type { LaunchParams, Options } from './types';
import { RETRIES, RETRY_MS } from './constants';

function launchParams(system: WebOSSystem | undefined): LaunchParams {
  try {
    return JSON.parse(system?.launchParams || '{}') as LaunchParams;
  } catch {
    return {};
  }
}

export function useApps({ onError, onRelaunch }: Options): AppInfo[] {
  const [apps, setApps] = useState<AppInfo[]>(cachedApps);
  const keyRef = useRef(JSON.stringify(apps));
  const optsRef = useRef({ onError, onRelaunch });
  useLayoutEffect(() => {
    optsRef.current = { onError, onRelaunch };
  });

  useEffect(() => {
    let busy = false;
    let retry = 0;
    // Relaunch and visibilitychange often fire together: keep one request chain at a time.
    const refresh = (attempt = 0): void => {
      if (busy && attempt === 0) return;
      busy = true;
      loadApps()
        .then((list) => {
          busy = false;
          const key = JSON.stringify(list);
          if (key === keyRef.current) return;
          keyRef.current = key;
          setApps(list);
        })
        .catch((err: unknown) => {
          console.error(err);
          if (attempt < RETRIES) {
            retry = window.setTimeout(() => refresh(attempt + 1), RETRY_MS * (attempt + 1));
            return;
          }
          busy = false;
          optsRef.current.onError(err);
        });
    };

    // As the system Home app we are relaunched with launchType 'home' by the Home key, without it when an app closes.
    const onRelaunch = () => {
      if (launchParams(window.webOSSystem ?? window.PalmSystem).launchType === 'home') {
        optsRef.current.onRelaunch();
      }
      refresh();
    };
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener('webOSRelaunch', onRelaunch);
    document.addEventListener('visibilitychange', onVisible);
    refresh();
    return () => {
      clearTimeout(retry);
      document.removeEventListener('webOSRelaunch', onRelaunch);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return apps;
}
