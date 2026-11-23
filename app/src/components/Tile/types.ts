import type { AppInfo } from '../../lib/apps/types';

export interface Props {
  app: AppInfo;
  index: number;
  focused: boolean;
  pressed: boolean;
  // Wiggles while the viewer moves it around the grid.
  moving?: boolean;
  // Shows the app name under the tile while focused, as in the grid below the top row.
  titled?: boolean;
}
