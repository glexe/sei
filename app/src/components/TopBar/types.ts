import type { ClockFormat } from '../../lib/settings/types';
import type { Place, TemperatureUnit } from '../../lib/weather/types';

export interface Props {
  weatherPlace: Place | null;
  temperatureUnit: TemperatureUnit;
  clockFormat: ClockFormat;
  showWeekday: boolean;
  showDate: boolean;
  faded: boolean;
  hidden: boolean;
}
