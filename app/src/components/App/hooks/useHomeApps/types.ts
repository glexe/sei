import type { AppInfo } from '../../../../lib/apps/types';
import type { Options } from '../useApps/types';

export type { Options };

export interface HomeApps {
  // Loaded apps in the viewer's order, without ones being deleted.
  apps: AppInfo[];
  // Moves the app at `from` to `to` and saves the order.
  move: (from: number, to: number) => void;
  // Hides the app at once; rejects (and shows it again) if uninstalling fails.
  remove: (app: AppInfo) => Promise<void>;
}
