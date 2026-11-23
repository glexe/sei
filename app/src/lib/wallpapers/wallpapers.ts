import type { Painted, Picture, Wallpaper } from './types';
import { COLORS, GRADIENTS, SMALL_WORDS } from './constants';

const images = import.meta.glob<string>('../../assets/wallpapers/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const titleCase = (slug: string) =>
  slug
    .split('-')
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');

const pictures: Picture[] = Object.entries(images)
  .filter(([path]) => !path.endsWith('.thumb.jpg'))
  .map(([path, src]) => {
    const id = path.slice(path.lastIndexOf('/') + 1, -'.jpg'.length);
    return {
      id,
      title: titleCase(id),
      kind: 'pictures',
      src,
      thumb: images[path.replace(/\.jpg$/, '.thumb.jpg')] ?? src,
    };
  });

const painted = (ids: readonly string[], kind: Painted['kind']): Painted[] =>
  ids.map((id) => ({ id, title: titleCase(id), kind }));

export const WALLPAPERS: readonly Wallpaper[] = [
  ...pictures,
  ...painted(COLORS, 'colors'),
  ...painted(GRADIENTS, 'gradients'),
];

export const DEFAULT_WALLPAPER = WALLPAPERS[0].id;

export const findWallpaper = (id: string): Wallpaper =>
  WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
