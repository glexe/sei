// `pending`: installed, but webOS picks a new home only at boot.
export type HomeState = 'none' | 'pending' | 'active';

export interface PackageInfo {
  version: string;
  root: boolean;
  home: HomeState;
}
