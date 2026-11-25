import { version as ownVersion } from '../../../../package.json';
import { SERVICE } from '../luna/constants';
import { errorText, lunaCall } from '../luna/luna';
import { readJson, writeJson } from '../storage/storage';
import type { HomeState, PackageInfo } from './types';
import {
  APP_MANAGER,
  CONFIRM_MS,
  ELEVATE_MS,
  ELEVATED_TRIES,
  ELEVATED_WAIT_MS,
  HOMEBREW,
  HOME_DIR,
  INSTALL_MS,
  PACKAGE_ID,
  SERVICE_ID,
  UPDATED_KEY,
} from './constants';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// The same build runs from its package as the setup screen and as the system Home.
export function runsFromPackage(): boolean {
  const id = (window.webOSSystem ?? window.PalmSystem)?.identifier ?? '';
  return id.split(' ')[0] === PACKAGE_ID;
}

export async function fetchPackage(): Promise<PackageInfo> {
  const res = await lunaCall(SERVICE + '/getInfo');
  return {
    version: String(res.version ?? ''),
    root: res.root === true,
    home: (res.home as HomeState | undefined) ?? 'none',
  };
}

// Homebrew Channel rewrites how the service starts; the one already running has to quit first.
export async function elevate(): Promise<void> {
  if ((await fetchPackage()).root) return;
  await lunaCall(HOMEBREW + '/elevateService', { id: SERVICE_ID }, ELEVATE_MS);
  await lunaCall(SERVICE + '/quit');
  for (let i = 0; i < ELEVATED_TRIES; i++) {
    await wait(ELEVATED_WAIT_MS);
    const info = await fetchPackage().catch(() => null);
    if (info?.root) return;
  }
  throw new Error('service is not root');
}

export async function installHome(): Promise<HomeState> {
  const res = await lunaCall(SERVICE + '/install', {}, INSTALL_MS);
  return (res.home as HomeState | undefined) ?? 'pending';
}

export async function reboot(): Promise<void> {
  await lunaCall(HOMEBREW + '/reboot');
}

// The service went away with the package, so Homebrew Channel removes the home screen.
export async function removeHome(): Promise<void> {
  await lunaCall(HOMEBREW + '/exec', { command: `rm -rf ${HOME_DIR}` });
  await reboot();
}

export function isNewer(version: string, than: string): boolean {
  const a = version.split('.').map(Number);
  const b = than.split('.').map(Number);
  const i = a.findIndex((n, k) => n !== b[k]);
  return i >= 0 && a[i] > (b[i] ?? 0);
}

async function isPackageMissing(): Promise<boolean> {
  try {
    await lunaCall(APP_MANAGER + '/getAppInfo', { id: PACKAGE_ID });
    return false;
  } catch (err) {
    return errorText(err).startsWith('Invalid appId');
  }
}

// `tried` is the version last installed over this one: still running the old one means it didn't take.
export const needsUpdate = (version: string, running: string, tried: string): boolean =>
  isNewer(version, running) && version !== tried;

// Homebrew Channel updates only the package: elevate its new service and copy a newer version over this one.
async function update(): Promise<void> {
  const info = await fetchPackage();
  if (!info.root) await elevate();
  const tried = readJson(UPDATED_KEY, '', (value) => typeof value === 'string');
  // It did take, so after a downgrade the same version may be installed again.
  if (tried === ownVersion) writeJson(UPDATED_KEY, '');
  if (!needsUpdate(info.version, ownVersion, tried)) return;
  await installHome();
  writeJson(UPDATED_KEY, info.version);
  location.reload();
}

// Brings the home screen in line with its package; resolves to true when the package was uninstalled.
export async function syncPackage(): Promise<boolean> {
  try {
    await update();
    return false;
  } catch (err) {
    console.error(err);
    if (!(await isPackageMissing())) return false;
    await wait(CONFIRM_MS);
    return isPackageMissing();
  }
}
