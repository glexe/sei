import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { syncPackage } from '../../../../lib/setup/setup';

// Updates the home screen from its package whenever it comes to the front, and notices an uninstall.
export function usePackage(onUninstalled: () => void): void {
  const uninstalledRef = useRef(onUninstalled);
  useLayoutEffect(() => {
    uninstalledRef.current = onUninstalled;
  });

  useEffect(() => {
    let busy = false;
    const check = () => {
      if (busy || document.hidden) return;
      busy = true;
      void syncPackage().then((uninstalled) => {
        busy = false;
        if (uninstalled) uninstalledRef.current();
      });
    };
    document.addEventListener('webOSRelaunch', check);
    document.addEventListener('visibilitychange', check);
    check();
    return () => {
      document.removeEventListener('webOSRelaunch', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
}
