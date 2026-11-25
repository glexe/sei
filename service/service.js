// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const Service = require('webos-service');
const {
  SERVICE_ID,
  HOME_ID,
  APP_DIR,
  PACKAGE_DIR,
  APP_MANAGER,
  APP_INSTALLER,
  BRAND_LOGOS,
  BRAND_LOGOS_MS,
  REMOVE_MS,
  CACHE_DIR,
  LOG_FILE,
  IMAGE_FIELDS,
  IDLE_MS,
  QUIT_MS,
  STORAGE_ROOT,
  MAX_ENTRIES,
  HIDDEN,
  STATE_FILE,
} = require('./constants');
const { version } = require('./package.json');
const { historyFile, insideStorage, isHome, isPackage } = require('./access');
const { installHome } = require('./install');

// Response shapes are the web app's own types, so both sides check against one contract.
/** @typedef {import('../app/src/lib/apps/types').LaunchPoint} LaunchPoint */
/** @typedef {import('../app/src/lib/files/types').FileEntry} FileEntry */
/** @typedef {import('../app/src/lib/files/types').Storage} Storage */
/** @typedef {import('../app/src/lib/setup/types').HomeState} HomeState */
/** @typedef {import('webos-service').Message} Message */
/** @typedef {Record<string, any>} Payload */

const service = new Service(SERVICE_ID);

/** @param {...unknown} parts */
function log(...parts) {
  const text = parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ');
  try {
    fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${text}\n`);
  } catch {}
}
process.on('uncaughtException', (e) => {
  log('uncaught', String((e && e.stack) || e));
  process.exit(1);
});

/** @type {NodeJS.Timeout | undefined} */
let idleTimer;
function keepAlive() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    idleTimer = undefined;
  }, IDLE_MS);
}
keepAlive();

/**
 * @param {string} uri
 * @param {Record<string, unknown>} [params]
 * @returns {Promise<Payload>}
 */
function call(uri, params) {
  keepAlive();
  return new Promise((resolve, reject) => {
    service.call(uri, params || {}, (res) => {
      const payload = (res && res.payload) || {};
      if (payload.returnValue === false) {
        log('call failed', uri, payload.errorText || '');
        reject(payload);
      } else {
        resolve(payload);
      }
    });
  });
}

/**
 * @param {Message} message
 * @param {any} err
 */
function fail(message, err) {
  message.respond({
    returnValue: false,
    errorText: (err && (err.errorText || err.message)) || String(err),
  });
}

// The bus lets any app call in, and the service acts as root: every method answers only the launcher itself.
/**
 * @param {string} method
 * @param {(message: Message) => void} handler
 * @param {(sender: string | undefined) => boolean} [allowed]
 */
function register(method, handler, allowed = isHome) {
  service.register(method, (message) => {
    if (allowed(message.sender)) return handler(message);
    log('rejected caller', message.sender || '', method);
    fail(message, 'not allowed');
  });
}

// The few methods its setup screen needs too.
/** @param {string | undefined} sender */
const isHomeOrPackage = (sender) => isHome(sender) || isPackage(sender);

// mtime of each icon already copied, so repeated listApps skip the copy and the second stat.
/** @type {Map<string, number>} */
const copied = new Map();

// The web app can read only its own folder, so other apps' icons are copied into it.
/** @param {string | undefined} src */
function cacheImage(src) {
  if (!src || src.charAt(0) !== '/') return src || '';
  const name = src.slice(1).replace(/[^\w.-]/g, '_');
  try {
    const { mtimeMs } = fs.statSync(src);
    if (copied.get(name) !== mtimeMs) {
      fs.copyFileSync(src, path.join(CACHE_DIR, name));
      copied.set(name, mtimeMs);
    }
    // The version makes an updated icon a new URL, so the launcher re-renders and the browser refetches it.
    return `cache/${name}?v=${Math.round(mtimeMs)}`;
  } catch (e) {
    log('cache failed', src, e instanceof Error ? e.message : String(e));
    return '';
  }
}

/**
 * @param {LaunchPoint} lp
 * @returns {LaunchPoint}
 */
function withCachedImages(lp) {
  /** @type {LaunchPoint & Record<string, unknown>} */
  const out = { ...lp };
  for (const field of IMAGE_FIELDS) out[field] = cacheImage(/** @type {any} */ (lp)[field]);
  return out;
}

// Icons of uninstalled apps would otherwise stay in the cache forever.
/** @param {LaunchPoint[]} launchPoints */
function sweepCache(launchPoints) {
  const used = new Set(
    launchPoints.flatMap((lp) =>
      IMAGE_FIELDS.map((f) =>
        String(/** @type {any} */ (lp)[f] || '').replace(/^cache\/|\?.*$/g, ''),
      ),
    ),
  );
  for (const name of fs.readdirSync(CACHE_DIR)) {
    if (used.has(name)) continue;
    try {
      fs.unlinkSync(path.join(CACHE_DIR, name));
      copied.delete(name);
    } catch {}
  }
}

// Logos of the devices on the inputs, by the input's app id; a TV without the detector just has none.
/** @returns {Promise<Map<string, string>>} */
function brandLogos() {
  /** @type {Promise<Payload>} */
  const late = new Promise((resolve) => setTimeout(resolve, BRAND_LOGOS_MS, {}));
  return Promise.race([call(BRAND_LOGOS), late])
    .catch(() => /** @type {Payload} */ ({}))
    .then(({ imageInfo }) => {
      const list = Array.isArray(imageInfo) ? imageInfo : [];
      return new Map(list.map(({ appId, imagePath }) => [appId, (imagePath || {}).large || '']));
    });
}

register('listApps', (message) => {
  Promise.all([call(APP_MANAGER + '/listLaunchPoints', {}), brandLogos()])
    .then(([res, logos]) => {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      // Hidden ones too: the launcher shows every launch point
      const launchPoints = /** @type {LaunchPoint[]} */ (res.launchPoints || []).map((lp) =>
        withCachedImages({ ...lp, brandLogo: logos.get(lp.id) }),
      );
      sweepCache(launchPoints);
      message.respond({ returnValue: true, launchPoints });
    })
    .catch((err) => fail(message, err));
});

// A pulled drive or power cut mid-write must leave the old file intact: write a temp file, fsync, rename.
/**
 * @param {string} file
 * @param {unknown} value
 */
function writeAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  // Exclusive, so a symlink planted under this name is never followed.
  fs.rmSync(tmp, { force: true });
  const fd = fs.openSync(tmp, 'wx');
  try {
    fs.writeSync(fd, JSON.stringify(value));
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, file);
}

/**
 * @param {string} file
 * @returns {Record<string, unknown>}
 */
function readObject(file) {
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

// Without Homebrew's elevation the service runs sandboxed and can't see /var/lib/sei at all.
const isRoot = () => typeof process.getuid === 'function' && process.getuid() === 0;

// webOS finds a new home only at boot, so right after installing the old one still runs.
/** @returns {Promise<HomeState>} */
function homeState() {
  if (!fs.existsSync(path.join(APP_DIR, 'appinfo.json'))) return Promise.resolve('none');
  return call(APP_MANAGER + '/getAppInfo', { id: HOME_ID }).then(
    ({ appInfo }) => (appInfo && appInfo.folderPath === APP_DIR ? 'active' : 'pending'),
    () => 'pending',
  );
}

register(
  'getInfo',
  (message) => {
    homeState().then((home) =>
      message.respond({ returnValue: true, version, root: isRoot(), home }),
    );
  },
  isHomeOrPackage,
);

register(
  'install',
  (message) => {
    keepAlive();
    try {
      installHome(PACKAGE_DIR, APP_DIR);
    } catch (err) {
      log('install failed', err instanceof Error ? err.message : String(err));
      return fail(message, err);
    }
    homeState().then((home) => message.respond({ returnValue: true, version, home }));
  },
  isHomeOrPackage,
);

// Elevation applies to the next process only.
register(
  'quit',
  (message) => {
    message.respond({ returnValue: true });
    setTimeout(() => process.exit(0), QUIT_MS);
  },
  isHomeOrPackage,
);

register('launch', (message) => {
  const { id, params } = message.payload || {};
  if (!id) return fail(message, 'id is required');
  call(APP_MANAGER + '/launch', { id, params: params || {} })
    .then((res) => message.respond({ returnValue: true, appId: res.appId || id }))
    .catch((err) => fail(message, err));
});

// appInstallService accepts any id at once and reports the outcome only through status updates.
/** @param {string} id */
function removeApp(id) {
  return new Promise((resolve, reject) => {
    const sub = service.subscribe(APP_INSTALLER + '/remove', { id, subscribe: true });
    /**
     * @param {(value: unknown) => void} settle
     * @param {unknown} value
     */
    const done = (settle, value) => {
      clearTimeout(timer);
      sub.cancel();
      settle(value);
    };
    const timer = setTimeout(() => done(reject, { errorText: 'remove timed out' }), REMOVE_MS);
    sub.on('response', (res) => {
      keepAlive();
      const payload = (res && res.payload) || {};
      const state = payload.details && payload.details.state;
      if (payload.returnValue === false) done(reject, payload);
      else if (state === 'removed') done(resolve, payload);
      else if (state === 'remove failed')
        done(reject, { errorText: payload.details.errorText || state });
    });
  });
}

// Uninstalls a user app; checks SAM's own removable flag rather than trusting the caller.
register('remove', (message) => {
  const id = String((message.payload || {}).id || '');
  if (!id) return fail(message, 'id is required');
  keepAlive();
  call(APP_MANAGER + '/listLaunchPoints', {})
    .then((res) => {
      const points = /** @type {LaunchPoint[]} */ (res.launchPoints || []);
      const lp = points.find((point) => point.id === id);
      if (!lp || !lp.removable) throw { errorText: 'app is not removable' };
      return removeApp(id);
    })
    .then(() => message.respond({ returnValue: true }))
    .catch((err) => {
      log('remove failed', id, err.errorText || '');
      fail(message, err);
    });
});

// ---- Files: read-only listing of attached USB storage ----

/** @param {string} dir */
function storageSpace(dir) {
  try {
    const s = fs.statfsSync(dir);
    return { total: s.blocks * s.bsize, free: s.bavail * s.bsize };
  } catch {
    return {};
  }
}

register('listStorages', (message) => {
  call('luna://com.webos.service.attachedstoragemanager/listDevices', {})
    .then((res) => {
      /** @type {Storage[]} */
      const storages = [];
      for (const dev of res.devices || []) {
        if (dev.deviceType !== 'usb') continue;
        const parts = dev.subDevices || [];
        for (const part of parts) {
          if (!part.deviceUri || !part.deviceUri.startsWith(STORAGE_ROOT)) continue;
          const name = parts.length > 1 ? `${dev.deviceName} (${part.deviceName})` : dev.deviceName;
          storages.push({
            id: part.deviceId,
            name,
            path: part.deviceUri,
            ...storageSpace(part.deviceUri),
          });
        }
      }
      message.respond({ returnValue: true, storages });
    })
    .catch((err) => fail(message, err));
});

/**
 * @param {FileEntry} a
 * @param {FileEntry} b
 */
const byFolderThenName = (a, b) =>
  Number(b.dir) - Number(a.dir) || a.name.localeCompare(b.name, undefined, { numeric: true });

register('listDir', (message) => {
  const requested = (message.payload || {}).path;
  keepAlive();
  let dir = '';
  let truncated = false;
  Promise.resolve()
    .then(() => {
      dir = insideStorage(requested);
      return fs.promises.readdir(dir, { withFileTypes: true });
    })
    .then((items) => {
      // Sorted before the cut, so a huge folder shows its first entries rather than an arbitrary set.
      const visible = items
        .filter((d) => !HIDDEN.test(d.name))
        .map((d) => ({ name: d.name, dir: d.isDirectory(), size: 0, modified: 0 }))
        .sort(byFolderThenName);
      truncated = visible.length > MAX_ENTRIES;
      return Promise.all(
        visible.slice(0, MAX_ENTRIES).map((d) =>
          fs.promises
            .stat(path.join(dir, d.name))
            .then((st) => ({
              name: d.name,
              dir: st.isDirectory(),
              size: st.isDirectory() ? 0 : st.size,
              modified: st.mtimeMs,
            }))
            .catch(() => null),
        ),
      );
    })
    .then((entries) => {
      const list = /** @type {FileEntry[]} */ (entries.filter(Boolean)).sort(byFolderThenName);
      message.respond({ returnValue: true, path: String(requested), entries: list, truncated });
    })
    .catch((err) => fail(message, err));
});

// ---- Persistent state: settings and app order on the TV, playback history on each drive ----

// Only a missing file means "no state yet"; any other read error fails, so the launcher never overwrites real state.
register('getState', (message) => {
  if (!fs.existsSync(path.dirname(STATE_FILE)) && !isRoot())
    return fail(message, 'service is not root');
  if (!fs.existsSync(STATE_FILE)) return message.respond({ returnValue: true, state: {} });
  try {
    message.respond({ returnValue: true, state: JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) });
  } catch (err) {
    fail(message, err);
  }
});

register('setState', (message) => {
  const state = (message.payload || {}).state;
  if (!state || typeof state !== 'object') return fail(message, 'state is required');
  try {
    writeAtomic(STATE_FILE, state);
    message.respond({ returnValue: true });
  } catch (err) {
    fail(message, err);
  }
});

register('readHistory', (message) => {
  try {
    const history = readObject(historyFile((message.payload || {}).root));
    message.respond({ returnValue: true, history });
  } catch (err) {
    fail(message, err);
  }
});

register('writeHistory', (message) => {
  const history = (message.payload || {}).history;
  if (!history || typeof history !== 'object') return fail(message, 'history is required');
  keepAlive();
  try {
    writeAtomic(historyFile((message.payload || {}).root), history);
    message.respond({ returnValue: true });
  } catch (err) {
    log('history write failed', err instanceof Error ? err.message : String(err));
    fail(message, err);
  }
});
