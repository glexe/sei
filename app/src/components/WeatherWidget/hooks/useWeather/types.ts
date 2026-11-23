import type { Weather } from '../../../../lib/weather/types';

export interface Cached extends Weather {
  key: string;
}
