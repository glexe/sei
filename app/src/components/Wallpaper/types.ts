import type { Wallpaper as WallpaperData } from '../../lib/wallpapers/types';

export interface Props {
  wallpaper: WallpaperData;
  thumb?: boolean;
  fill?: boolean;
}
