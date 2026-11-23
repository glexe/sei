import { useEffect, useState } from 'preact/hooks';
import { applyOrder, removeApp } from '../../../../lib/apps/apps';
import type { AppInfo } from '../../../../lib/apps/types';
import { useAppOrder } from '../useAppOrder/useAppOrder';
import { useApps } from '../useApps/useApps';
import type { HomeApps, Options } from './types';

// The home screen's app collection: SAM's list, the saved order and optimistic deletes.
export function useHomeApps(options: Options): HomeApps {
  const loaded = useApps(options);
  const [order, setOrder] = useAppOrder();
  const [removed, setRemoved] = useState<string[]>([]);
  const apps = applyOrder(loaded, order).filter((app) => !removed.includes(app.id));

  // Forget a deleted app once SAM's list drops it, so a later reinstall shows up again.
  useEffect(() => {
    setRemoved((ids) => ids.filter((id) => loaded.some((app) => app.id === id)));
  }, [loaded]);

  const move = (from: number, to: number) => {
    const ids = apps.map((app) => app.id);
    ids.splice(to, 0, ...ids.splice(from, 1));
    setOrder(ids);
  };

  const remove = (app: AppInfo) => {
    setRemoved((ids) => [...ids, app.id]);
    return removeApp(app).catch((err: unknown) => {
      setRemoved((ids) => ids.filter((id) => id !== app.id));
      throw err;
    });
  };

  return { apps, move, remove };
}
