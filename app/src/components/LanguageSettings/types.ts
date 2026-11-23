import type { ComponentType } from 'preact';
import type { IconProps } from '../../icons/types';
import type { ListFocus } from '../../primitives/List/types';

export interface Props extends ListFocus {
  title: string;
  icon: ComponentType<IconProps>;
  caption: string;
  // Label of the null choice: "Default" for audio, "Off" for subtitles, "TV Language" for the UI.
  noneLabel: string;
  // Each language named in itself ("Deutsch"), for picking the UI language.
  native?: boolean;
  value: string | null;
  onSelect: (code: string | null) => void;
  onBack: () => void;
}
