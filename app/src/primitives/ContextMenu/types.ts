import type { ComponentType } from 'preact';
import type { IconProps } from '../../icons/types';

export interface MenuAction {
  label: string;
  icon?: ComponentType<IconProps>;
  // Red, for actions like Delete.
  destructive?: boolean;
}

export interface Props {
  actions: MenuAction[];
  onSelect: (index: number) => void;
  onClose: () => void;
}
