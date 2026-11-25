import { PINNED } from '../../config/constants';
import { lunaCall } from '../luna/luna';
import { fetchState, saveState } from '../state/state';
import { PACKAGE_ID } from '../setup/constants';
import { isRecord, isStringArray, readJson, writeJson } from '../storage/storage';
import type { LaunchPoint, AppInfo, ListAppsResponse } from './types';
import { SERVICE } from '../luna/constants';
import { BRAND_COLOR, CACHE_KEY, INTERNAL_TILES, ORDER_KEY, REMOVE_TIMEOUT_MS } from './constants';

function normalize(lp: LaunchPoint): AppInfo {
  return {
    id: lp.id,
    title: lp.title || lp.id,
    icon: lp.brandLogo || lp.extraLargeIcon || lp.largeIcon || lp.mediumLargeIcon || lp.icon || '',
    logo: false,
    color: (lp.brandLogo && BRAND_COLOR) || lp.iconColor || lp.bgColor || '',
    params: lp.params || {},
    removable: !!lp.removable,
  };
}

export function arrange(found: LaunchPoint[]): AppInfo[] {
  // The package's own icon only leads back to setup.
  const launchPoints = found.filter((lp) => lp.id !== PACKAGE_ID);
  const byId = new Map(launchPoints.map((lp) => [lp.id, lp]));
  const top = PINNED.flatMap((id) => {
    const tile = INTERNAL_TILES.find((t) => t.id === id);
    if (tile) return [tile];
    const lp = byId.get(id);
    return lp ? [normalize(lp)] : [];
  });
  // Our own tiles that aren't pinned open the grid, right below the top row.
  const own = INTERNAL_TILES.filter((tile) => !PINNED.includes(tile.id));
  // Every launch point, including the ones LG marks hidden (inputs, Live TV, apps hidden in LG Home).
  const rest = launchPoints.filter((lp) => !PINNED.includes(lp.id)).map(normalize);
  return [...top, ...own, ...rest];
}

// Saved order first; apps missing from it (new installs) keep arrange()'s order at the end.
export function applyOrder(apps: AppInfo[], order: readonly string[]): AppInfo[] {
  if (order.length === 0) return apps;
  const rank = new Map(order.map((id, i) => [id, i]));
  const at = (app: AppInfo) => rank.get(app.id) ?? order.length;
  return apps
    .map((app, i) => ({ app, i }))
    .sort((a, b) => at(a.app) - at(b.app) || a.i - b.i)
    .map(({ app }) => app);
}

export const loadOrder = (): string[] => readJson(ORDER_KEY, [], isStringArray);

export function saveOrder(ids: string[]): void {
  writeJson(ORDER_KEY, ids);
  saveState({ appOrder: ids });
}

// The service's copy of the order, or null when it has none yet (then the cached order seeds it).
export async function restoreOrder(): Promise<string[] | null> {
  const state = await fetchState();
  if (!state) return null;
  if (!isStringArray(state.appOrder)) {
    saveState({ appOrder: loadOrder() });
    return null;
  }
  writeJson(ORDER_KEY, state.appOrder);
  return state.appOrder;
}

const isLaunchPoints = (value: unknown): value is LaunchPoint[] =>
  Array.isArray(value) && value.every((lp) => isRecord(lp) && typeof lp.id === 'string');

export const cachedApps = (): AppInfo[] => arrange(readJson(CACHE_KEY, [], isLaunchPoints));

const remember = (launchPoints: LaunchPoint[]): void => writeJson(CACHE_KEY, launchPoints);

export async function loadApps(): Promise<AppInfo[]> {
  const res = await lunaCall<ListAppsResponse>(SERVICE + '/listApps');
  const launchPoints = res.launchPoints ?? [];
  remember(launchPoints);
  return arrange(launchPoints);
}

export async function removeApp(app: AppInfo): Promise<void> {
  await lunaCall(SERVICE + '/remove', { id: app.id }, REMOVE_TIMEOUT_MS);
}

export async function launchApp(app: AppInfo): Promise<void> {
  await lunaCall(SERVICE + '/launch', { id: app.id, params: app.params });
}
