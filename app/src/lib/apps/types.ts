import type { LunaResponse } from '../luna/types';

export interface LaunchPoint {
  id: string;
  title?: string;
  icon?: string;
  largeIcon?: string;
  mediumLargeIcon?: string;
  extraLargeIcon?: string;
  // The logo of the device on an HDMI input, recognized by the TV.
  brandLogo?: string;
  iconColor?: string;
  bgColor?: string;
  params?: Record<string, unknown>;
  // False for system apps, which can't be uninstalled.
  removable?: boolean;
}

export interface AppInfo {
  id: string;
  title: string;
  icon: string;
  logo: boolean;
  color: string;
  params: Record<string, unknown>;
  removable: boolean;
  internal?: 'files' | 'settings';
}

export interface ListAppsResponse extends LunaResponse {
  launchPoints?: LaunchPoint[];
}
