import type { Storage } from '../files/types';

export const names: [string, string][] = [
  ['Movies', '#e50914'],
  ['Video', '#ff0033'],
  ['Shows', '#0f79af'],
  ['Music', '#fa2d48'],
  ['Sports', '#1db954'],
  ['Browser', '#3b6cf6'],
  ['Media Player', '#7e56b1'],
  ['Games', '#ff8a00'],
  ['HDMI 1', '#6d757f'],
  ['Gallery', '#00a8a8'],
  ['Weather', '#2d9cdb'],
  ['Store', '#4faa6e'],
  ['News', '#c0392b'],
];

export const STORAGES: Storage[] = [
  { id: 'mock', name: 'Portable SSD', path: '/tmp/usb/sda/sda1', total: 1e12, free: 1.6e11 },
];
