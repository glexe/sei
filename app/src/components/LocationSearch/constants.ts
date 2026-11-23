import type { MessageKey } from '../../lib/i18n/types';
import type { Status } from './types';

export const INPUT = -1;

export const DEBOUNCE_MS = 400;

export const STATUS_TEXT: Record<Exclude<Status, 'done'>, MessageKey> = {
  idle: 'location.idle',
  loading: 'location.searching',
  empty: 'location.empty',
  error: 'location.failed',
};
