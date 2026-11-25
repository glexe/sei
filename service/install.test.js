import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import install from './install';

const { installHome } = install;

describe('installHome', () => {
  let base = '';
  let source = '';
  let target = '';
  /**
   * @param {string} file
   * @param {string} text
   */
  const write = (file, text) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  };
  /** @param {string[]} parts */
  const read = (...parts) => fs.readFileSync(path.join(target, ...parts), 'utf8');
  const share = () => {};

  beforeEach(() => {
    base = fs.mkdtempSync(path.join(os.tmpdir(), 'sei-'));
    source = path.join(base, 'package');
    target = path.join(base, 'palm', 'applications', 'home');
    write(path.join(source, 'index.html'), 'new');
    write(path.join(source, 'appinfo.json'), 'package');
    write(path.join(source, 'home.json'), 'home');
  });
  afterEach(() => fs.rmSync(base, { recursive: true }));

  it("installs the package's files under the home screen's appinfo", () => {
    installHome(source, target, share);
    expect(read('index.html')).toBe('new');
    expect(read('appinfo.json')).toBe('home');
    expect(fs.readdirSync(target).sort()).toEqual(['appinfo.json', 'cache', 'index.html']);
    expect(read('..', '..', '..', 'package', 'appinfo.json')).toBe('package');
  });

  it('replaces an old version but keeps its icon cache, and leaves nothing behind', () => {
    write(path.join(target, 'index.html'), 'old');
    write(path.join(target, 'assets', 'old.js'), 'old');
    write(path.join(target, 'cache', 'icon.png'), 'icon');
    installHome(source, target, share);
    expect(read('index.html')).toBe('new');
    expect(read('cache', 'icon.png')).toBe('icon');
    expect(fs.existsSync(path.join(target, 'assets'))).toBe(false);
    expect(fs.readdirSync(path.join(base, 'palm'))).toEqual(['applications']);
    expect(fs.readdirSync(path.dirname(target))).toEqual(['home']);
  });

  it('keeps the old version when the new one is incomplete', () => {
    write(path.join(target, 'index.html'), 'old');
    fs.rmSync(path.join(source, 'home.json'));
    expect(() => installHome(source, target, share)).toThrow();
    expect(read('index.html')).toBe('old');
  });
});
