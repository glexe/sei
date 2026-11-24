import type { LaunchPoint } from '../apps/types';
import type { FileEntry } from '../files/types';
import type { LunaResponse } from '../luna/types';
import { names, STORAGES } from './constants';

const launchPoints = (): LaunchPoint[] =>
  names.map(([title, color], i) => ({
    id: 'mock.app.' + i,
    title,
    iconColor: color,
    removable: i % 2 === 1,
  }));

function dir(path: string): FileEntry[] {
  const day = 86_400_000;
  const now = Date.now();
  if (path.endsWith('Shows')) {
    return Array.from({ length: 24 }, (_, i) => ({
      name: `Episode ${i + 1}.mkv`,
      dir: false,
      size: 1.2e9 + i * 1e7,
      modified: now - i * day,
    }));
  }
  return [
    { name: 'Movies', dir: true, size: 0, modified: now - 3 * day },
    { name: 'Shows', dir: true, size: 0, modified: now - 9 * day },
    { name: 'Photos', dir: true, size: 0, modified: now - 40 * day },
    { name: 'Big Movie (2160p).mkv', dir: false, size: 46e9, modified: now - 90 * day },
    { name: 'Album.flac', dir: false, size: 3.4e8, modified: now - 120 * day },
    { name: 'notes.txt', dir: false, size: 12_712, modified: now - day },
  ];
}

// Answers for npm run dev, by service method; anything else succeeds empty.
export function mockCall(uri: string, params: Record<string, unknown>): LunaResponse {
  const method = uri.slice(uri.lastIndexOf('/') + 1);
  if (method === 'listApps') return { launchPoints: launchPoints() };
  if (method === 'listStorages') return { storages: STORAGES };
  if (method === 'listDir') return { entries: dir(String(params.path)) };
  if (method === 'getInfo') return { version: '0.9.1', root: true };
  if (method === 'getSystemInfo') return { modelName: 'OLED65C3PUA', sdkVersion: '11.2.0' };
  if (method === 'getstatus') return { wifi: { state: 'connected', ipAddress: '192.168.1.20' } };
  if (method === 'getState') return { state: {} };
  if (method === 'readHistory') return { history: {} };
  return { returnValue: true };
}
