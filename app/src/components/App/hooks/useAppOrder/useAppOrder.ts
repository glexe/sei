import { useEffect, useState } from 'preact/hooks';
import { loadOrder, restoreOrder, saveOrder } from '../../../../lib/apps/apps';

// App ids in the order the viewer arranged them, saved on every change.
export function useAppOrder(): [string[], (ids: string[]) => void] {
  const [order, setOrder] = useState(loadOrder);

  useEffect(() => {
    void restoreOrder().then((stored) => stored && setOrder(stored));
  }, []);

  const update = (ids: string[]) => {
    setOrder(ids);
    saveOrder(ids);
  };
  return [order, update];
}
