import { SERVICE } from '../luna/constants';
import { lunaCall } from '../luna/luna';
import type { LunaResponse } from '../luna/types';
import { isRecord } from '../storage/storage';
import type { ServiceStatus, TvInfo } from './types';
import { CONNECTION_MANAGER, SYSTEM_PROPERTY } from './constants';

export async function fetchService(): Promise<ServiceStatus> {
  try {
    const res = await lunaCall(SERVICE + '/getInfo');
    if (!res.root) return { state: 'noRoot' };
    return { state: 'running', version: String(res.version) };
  } catch {
    return { state: 'down' };
  }
}

// Asked directly rather than through the service, so it shows even when the service is down.
export async function fetchTv(): Promise<TvInfo> {
  const keys = ['modelName', 'sdkVersion'];
  const res = await lunaCall(SYSTEM_PROPERTY + '/getSystemInfo', { keys });
  return { model: String(res.modelName ?? ''), webos: String(res.sdkVersion ?? '') };
}

// The cable wins when both are up: that is the route the TV uses.
export function ipOf(status: LunaResponse): string {
  for (const link of [status.wired, status.wifi]) {
    if (isRecord(link) && link.state === 'connected' && link.ipAddress) {
      return String(link.ipAddress);
    }
  }
  return '';
}

export const fetchIp = async (): Promise<string> =>
  ipOf(await lunaCall(CONNECTION_MANAGER + '/getstatus'));
