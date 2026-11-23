'use strict';

const path = require('path');

const SERVICE_ID = 'com.glexe.sei.service';
const APP_MANAGER = 'luna://com.webos.service.applicationmanager';
const APP_INSTALLER = 'luna://com.webos.appInstallService';
// LG's detector of HDMI devices: it recognizes them by SPD and CEC and downloads their brands' logos.
const BRAND_LOGOS = 'luna://com.webos.service.ics/blaster/getBrandLogo';
const BRAND_LOGOS_MS = 2000;
// The launcher is installed as the system Home app (scripts/home/home.sh).
const HOME_ID = 'com.webos.app.home';
const APP_DIR = '/media/system/apps/usr/palm/applications/' + HOME_ID;
const CACHE_DIR = path.join(APP_DIR, 'cache');
const LOG_FILE = '/tmp/sei-service.log';
const IMAGE_FIELDS = ['icon', 'largeIcon', 'mediumLargeIcon', 'extraLargeIcon', 'brandLogo'];
// Under the root runner Node exits before Luna replies unless kept alive.
const IDLE_MS = 60 * 1000;
const REMOVE_MS = 2 * 60 * 1000;
const STORAGE_ROOT = '/tmp/usb/';
const MAX_ENTRIES = 5000;
// Settings and app order: outside WebAppMgr's localStorage, which webOS wipes whenever any app is uninstalled.
const STATE_FILE = '/var/lib/sei/state.json';
// Playback history lives on each drive, so it travels with the files.
const HISTORY_FILE = '.sei/history.json';
// macOS/exFAT/Windows service files that are never interesting to browse.
const HIDDEN = /^(\.|\$|System Volume Information$)/;

module.exports = {
  SERVICE_ID,
  APP_MANAGER,
  APP_INSTALLER,
  BRAND_LOGOS,
  BRAND_LOGOS_MS,
  HOME_ID,
  APP_DIR,
  CACHE_DIR,
  LOG_FILE,
  IMAGE_FIELDS,
  IDLE_MS,
  REMOVE_MS,
  STORAGE_ROOT,
  MAX_ENTRIES,
  STATE_FILE,
  HISTORY_FILE,
  HIDDEN,
};
