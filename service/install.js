// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { HOME_APPINFO } = require('./constants');

// The installer leaves a package's folders writable by everyone; the home screen must not be.
/** @param {string} dir */
function shareWithJail(dir) {
  execFileSync('chown', ['-R', 'root:jailer', dir]);
  execFileSync('chmod', ['-R', 'u=rwX,go=rX', dir]);
}

// Puts the package's own files in place of LG Home. Whatever fails before the swap leaves the old home untouched.
/**
 * @param {string} source
 * @param {string} target
 * @param {(dir: string) => void} [share]
 */
function installHome(source, target, share = shareWithJail) {
  // Beside applications/, not in it: webOS scans every folder there for apps.
  const staging = path.join(path.dirname(path.dirname(target)), 'sei-staging');
  const old = `${staging}-old`;
  for (const dir of [staging, old]) fs.rmSync(dir, { recursive: true, force: true });

  fs.cpSync(source, staging, { recursive: true });
  fs.renameSync(path.join(staging, HOME_APPINFO), path.join(staging, 'appinfo.json'));
  // Icons of other apps: keeping them shows the grid without a gap after an update.
  const cache = path.join(target, 'cache');
  if (fs.existsSync(cache)) fs.cpSync(cache, path.join(staging, 'cache'), { recursive: true });
  else fs.mkdirSync(path.join(staging, 'cache'));
  share(staging);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) fs.renameSync(target, old);
  fs.renameSync(staging, target);
  fs.rmSync(old, { recursive: true, force: true });
}

module.exports = { installHome };
