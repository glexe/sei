import type { ComponentType } from 'preact';
import type { IconProps } from '../../icons/types';
import type { MessageKey } from '../../lib/i18n/types';
import type { Menu } from './hooks';

export interface Props {
  name: string;
  path: string;
  // Drive mount point and path inside it, where the position is saved; null for no history.
  root: string;
  rel: string | null;
  audioLanguage: string | null;
  subtitleLanguage: string | null;
  onClose: () => void;
}

export type Area = 'center' | 'tools' | 'bar';

export interface Tool {
  id: Menu;
  label: MessageKey;
  icon: ComponentType<IconProps>;
}
