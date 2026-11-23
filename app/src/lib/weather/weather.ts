import type { WeatherKind, TemperatureUnit, Weather, Place, GeoResult } from './types';

// WMO weather codes as used by Open-Meteo.
function kindOf(code: number): WeatherKind {
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'rain';
  return 'clear';
}

export async function fetchWeather(place: Place, unit: TemperatureUnit): Promise<Weather> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,weather_code&temperature_unit=${unit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = (await res.json()) as { current: { temperature_2m: number; weather_code: number } };
  return {
    temperature: Math.round(data.current.temperature_2m),
    kind: kindOf(data.current.weather_code),
  };
}

// Open-Meteo names places in `lang` where it can and falls back to English.
export async function searchPlaces(query: string, lang: string): Promise<Place[]> {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search' +
    `?name=${encodeURIComponent(query)}&count=8&language=${lang}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = (await res.json()) as { results?: GeoResult[] };
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(', '),
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
