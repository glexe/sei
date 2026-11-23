import type { ComponentType } from 'preact';

export interface RowData {
  id: string;
  label: string;
  value?: string;
  checked?: boolean;
  chevron?: boolean;
  // Shows a switch in this state; OK on the row flips it.
  toggle?: boolean;
  icon?: ComponentType<{ class?: string }>;
  // Fades the icon, e.g. for a watched video.
  dimmed?: boolean;
}

export interface Props extends RowData {
  index: number;
  focused: boolean;
  placed?: boolean;
}
