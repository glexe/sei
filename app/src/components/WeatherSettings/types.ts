import type { Settings } from '../../lib/settings/types';
import type { ListFocus } from '../../primitives/List/types';

export interface Props extends ListFocus {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onOpenLocation: () => void;
  onBack: () => void;
}
