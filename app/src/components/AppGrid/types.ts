import type { ComponentChildren } from 'preact';
import type { AppInfo } from '../../lib/apps/types';

export interface Props {
  apps: AppInfo[];
  focus: number;
  // The row scrolled into place; unlike focus, it stays while an overlay is open.
  row: number;
  pressed: number;
  moving: number;
  hidden: boolean;
  // Shown under the tile at menuIndex (-1: none).
  menuIndex: number;
  menu?: ComponentChildren;
  onPointerFocus: (index: number) => void;
  onPointerActivate: (index: number) => void;
}
