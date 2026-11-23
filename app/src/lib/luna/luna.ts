import { mockCall } from '../mock/mock';
import type { LunaResponse } from './types';
import { TIMEOUT_MS } from './constants';

// Bridges must stay referenced until they answer, or they get collected.
const pending = new Set<PalmServiceBridge>();

export function isWebOS(): boolean {
  return typeof window.PalmServiceBridge === 'function';
}

// Outside webOS only npm run dev answers, from lib/mock; the production build drops that branch and the fixtures.
export function lunaCall<T extends LunaResponse>(
  uri: string,
  params: Record<string, unknown> = {},
  timeoutMs = TIMEOUT_MS,
): Promise<T> {
  const Bridge = window.PalmServiceBridge;
  if (!Bridge) {
    if (import.meta.env.DEV) return Promise.resolve(mockCall(uri, params) as T);
    return Promise.reject({ returnValue: false, errorText: 'not running on webOS' });
  }
  return new Promise((resolve, reject) => {
    const bridge = new Bridge();
    pending.add(bridge);
    const timer = window.setTimeout(() => {
      pending.delete(bridge);
      bridge.cancel();
      reject({ returnValue: false, errorText: `${uri} did not answer` });
    }, timeoutMs);
    bridge.onservicecallback = (raw) => {
      clearTimeout(timer);
      pending.delete(bridge);
      let data: T;
      try {
        data = JSON.parse(raw) as T;
      } catch {
        data = { returnValue: false, errorText: raw } as T;
      }
      if (data.returnValue === false) reject(data);
      else resolve(data);
    };
    bridge.call(uri, JSON.stringify(params));
  });
}

export function errorText(err: unknown): string {
  if (err && typeof err === 'object' && 'errorText' in err) return String(err.errorText);
  return String(err);
}
