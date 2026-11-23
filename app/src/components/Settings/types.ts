import type { Settings as SettingsData } from '../../lib/settings/types';
import type { WallpaperKind } from '../../lib/wallpapers/types';

export interface Props {
  settings: SettingsData;
  onChange: (patch: Partial<SettingsData>) => void;
  onClose: () => void;
}

export type ScreenId =
  | 'home'
  | 'wallpaper'
  | WallpaperKind
  | 'weather'
  | 'location'
  | 'player'
  | 'language'
  | 'dateTime'
  | 'about'
  | 'audioLanguage'
  | 'subtitleLanguage';
