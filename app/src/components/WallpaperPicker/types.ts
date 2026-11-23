import type { WallpaperKind } from '../../lib/wallpapers/types';
import type { ListFocus } from '../../primitives/List/types';

export interface Props extends ListFocus {
  kind: WallpaperKind;
  // The selected wallpaper's id, possibly of another kind.
  selected: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}
