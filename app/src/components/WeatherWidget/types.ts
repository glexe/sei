import type { Place, TemperatureUnit } from '../../lib/weather/types';

export interface Props {
  place: Place | null;
  unit: TemperatureUnit;
}
