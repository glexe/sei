import type { Settings } from '../../lib/settings/types';
import type { WallpaperKind } from '../../lib/wallpapers/types';
import type { ListFocus } from '../../primitives/List/types';

export interface Props extends ListFocus {
  settings: Settings;
  onOpen: (kind: WallpaperKind) => void;
  onBack: () => void;
}
