interface Base {
  id: string;
  title: string;
}

export interface Picture extends Base {
  kind: 'pictures';
  src: string;
  thumb: string;
}

// Drawn by a class named after the id (components/Wallpaper).
export interface Painted extends Base {
  kind: 'colors' | 'gradients';
}

export type Wallpaper = Picture | Painted;

export type WallpaperKind = Wallpaper['kind'];
