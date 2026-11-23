import { useEffect, useState } from 'preact/hooks';
import { isRecord, readJson, writeJson } from '../../../../lib/storage/storage';
import { fetchWeather } from '../../../../lib/weather/weather';
import type { Place, TemperatureUnit, Weather } from '../../../../lib/weather/types';
import type { Cached } from './types';
import { CACHE_KEY, REFRESH_MS } from './constants';

const keyOf = (place: Place, unit: TemperatureUnit) => `${place.id}:${unit}`;

const isCached = (value: unknown): value is Cached =>
  isRecord(value) && typeof value.key === 'string' && typeof value.temperature === 'number';

function cached(key: string): Weather | null {
  const c = readJson<Cached | null>(CACHE_KEY, null, isCached);
  return c && c.key === key ? c : null;
}

export function useWeather(place: Place | null, unit: TemperatureUnit): Weather | null {
  const key = place ? keyOf(place, unit) : '';
  const [weather, setWeather] = useState<Weather | null>(() => (key ? cached(key) : null));

  useEffect(() => {
    if (!place) {
      setWeather(null);
      return;
    }
    let alive = true;
    setWeather(cached(key));
    const update = () =>
      fetchWeather(place, unit)
        .then((w) => {
          if (!alive) return;
          setWeather(w);
          writeJson(CACHE_KEY, { ...w, key });
        })
        .catch((err: unknown) => console.warn('weather', err));
    update();
    const id = setInterval(update, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [key]);

  return weather;
}
