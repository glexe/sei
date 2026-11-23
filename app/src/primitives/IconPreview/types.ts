import type { ComponentType } from 'preact';
import type { IconProps } from '../../icons/types';

export interface Props {
  icon: ComponentType<IconProps>;
  // Fades the icon, e.g. for a watched video.
  dimmed?: boolean;
  // 0–1; shows a progress bar under the icon.
  progress?: number;
}
