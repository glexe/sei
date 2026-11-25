export const PACKAGE_ID = 'com.glexe.sei';

export const SERVICE_ID = 'com.glexe.sei.service';

export const HOMEBREW = 'luna://org.webosbrew.hbchannel.service';

export const APP_MANAGER = 'luna://com.webos.service.applicationmanager';

// Where the service installs the home screen (service/constants.js APP_DIR).
export const HOME_DIR = '/media/system/apps/usr/palm/applications/com.webos.app.home';

// Elevation makes the bus reread its files, and a slow TV first has to start Homebrew Channel's service.
export const ELEVATE_MS = 120_000;

export const INSTALL_MS = 60_000;

// A quitting service may still answer for a moment, so the elevated one is asked for a few times.
export const ELEVATED_TRIES = 5;
export const ELEVATED_WAIT_MS = 1500;

// An update takes the package away for a moment; only one still missing after this is uninstalled.
export const CONFIRM_MS = 15_000;

// The version last installed over this one: if it didn't take, don't try it again and again.
export const UPDATED_KEY = 'updated.v1';
