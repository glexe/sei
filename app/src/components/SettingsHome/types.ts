import type { Settings } from '../../lib/settings/types';
import type { ListFocus } from '../../primitives/List/types';

export type Section = 'wallpaper' | 'weather' | 'player' | 'language' | 'dateTime' | 'about';

export interface Props extends ListFocus {
  settings: Settings;
  onOpen: (section: Section) => void;
  onClose: () => void;
}
