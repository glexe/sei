// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const { HOME_ID, PACKAGE_ID, STORAGE_ROOT, HISTORY_FILE } = require('./constants');

// An app's sender may carry a -pid suffix.
/** @param {string} id */
const senderOf = (id) => new RegExp(`^${id.replace(/\./g, '\\.')}(-\\d+)?$`);
const HOME_SENDER = senderOf(HOME_ID);
const PACKAGE_SENDER = senderOf(PACKAGE_ID);

/** @param {string | undefined} sender */
const isHome = (sender) => HOME_SENDER.test(String(sender || ''));

// The setup screen: the same app run from its package, before it becomes the home screen.
/** @param {string | undefined} sender */
const isPackage = (sender) => PACKAGE_SENDER.test(String(sender || ''));

// The real path, symlinks resolved; throws unless it is inside attached storage.
/**
 * @param {unknown} requested
 * @param {string} [storage]
 */
function insideStorage(requested, storage = STORAGE_ROOT) {
  const real = fs.realpathSync(path.resolve(String(requested || '')));
  if (!real.startsWith(storage)) throw new Error('path is outside attached storage');
  return real;
}

// A drive can carry symlinks, and the service reads and writes as root.
/**
 * @param {unknown} root
 * @param {string} [storage]
 */
function historyFile(root, storage = STORAGE_ROOT) {
  const file = path.join(insideStorage(root, storage), HISTORY_FILE);
  for (const part of [path.dirname(file), file]) {
    if (fs.lstatSync(part, { throwIfNoEntry: false })) insideStorage(part, storage);
  }
  return file;
}

module.exports = { isHome, isPackage, insideStorage, historyFile };
