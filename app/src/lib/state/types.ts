import type { Settings } from '../settings/types';

// /var/lib/sei/state.json on the TV, written by the service.
export interface PersistedState {
  settings?: Partial<Settings>;
  appOrder?: string[];
}
