import type { Place } from '../../lib/weather/types';

export interface Props {
  current: Place | null;
  onSelect: (place: Place) => void;
  onBack: () => void;
}

export type Status = 'idle' | 'loading' | 'empty' | 'error' | 'done';
