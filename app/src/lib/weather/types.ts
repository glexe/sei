export type WeatherKind = 'clear' | 'rain' | 'snow';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface Weather {
  temperature: number;
  kind: WeatherKind;
}

export interface Place {
  id: number;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface GeoResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}
