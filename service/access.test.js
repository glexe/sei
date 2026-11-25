import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import access from './access';

const { isHome, isPackage, insideStorage, historyFile } = access;

describe('isHome', () => {
  it.each(['com.webos.app.home', 'com.webos.app.home-1234'])('accepts %s', (sender) => {
    expect(isHome(sender)).toBe(true);
  });

  it.each([
    undefined,
    '',
    'youtube.leanback.v4',
    'com.webos.app.homeconnect',
    'com.webos.app.home-evil',
    'com.webos.app.home.evil',
    'com-webos-app-home',
    'x.com.webos.app.home',
  ])('rejects %s', (sender) => {
    expect(isHome(sender)).toBe(false);
  });
});

describe('isPackage', () => {
  it.each(['com.glexe.sei', 'com.glexe.sei-1234'])('accepts %s', (sender) => {
    expect(isPackage(sender)).toBe(true);
  });

  it.each([undefined, '', 'com.glexe.sei.service', 'com.glexe.seii', 'com.webos.app.home'])(
    'rejects %s',
    (sender) => {
      expect(isPackage(sender)).toBe(false);
    },
  );
});

describe('storage paths', () => {
  let base = '';
  let usb = '';
  let drive = '';
  let outside = '';

  beforeAll(() => {
    base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sei-')));
    usb = path.join(base, 'usb') + path.sep;
    drive = path.join(usb, 'sda1');
    outside = path.join(base, 'etc');
    fs.mkdirSync(path.join(drive, 'Movies'), { recursive: true });
    fs.mkdirSync(outside);
    fs.mkdirSync(path.join(base, 'usb-evil'));
    fs.symlinkSync(outside, path.join(drive, 'link'));
  });
  afterAll(() => fs.rmSync(base, { recursive: true }));

  it('allows folders on a drive', () => {
    expect(insideStorage(path.join(drive, 'Movies'), usb)).toBe(path.join(drive, 'Movies'));
  });

  it.each([
    ['another folder', () => outside],
    ['a path climbing out', () => path.join(drive, '..', '..', 'etc')],
    ['a symlink out of the drive', () => path.join(drive, 'link')],
    ['a folder whose name starts the same', () => path.join(base, 'usb-evil')],
    ['a missing folder', () => path.join(drive, 'nope')],
    ['nothing', () => undefined],
  ])('rejects %s', (_, requested) => {
    expect(() => insideStorage(requested(), usb)).toThrow();
  });

  it('keeps the history on the drive', () => {
    expect(historyFile(drive, usb)).toBe(path.join(drive, '.sei', 'history.json'));
    expect(() => historyFile(outside, usb)).toThrow();
  });

  it('refuses a history folder or file that is a symlink out of the drive', () => {
    const sei = path.join(drive, '.sei');
    fs.symlinkSync(outside, sei);
    expect(() => historyFile(drive, usb)).toThrow();
    fs.unlinkSync(sei);
    fs.mkdirSync(sei);
    fs.writeFileSync(path.join(outside, 'secret'), '{}');
    fs.symlinkSync(path.join(outside, 'secret'), path.join(sei, 'history.json'));
    expect(() => historyFile(drive, usb)).toThrow();
  });
});
