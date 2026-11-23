import { describe, expect, it } from 'vitest';
import { applyOrder, arrange } from './apps';
import { BRAND_COLOR, FILES_TILE, SETTINGS_TILE } from './constants';
import type { AppInfo } from './types';

const app = (id: string): AppInfo => ({
  id,
  title: id,
  icon: '',
  logo: false,
  color: '',
  params: {},
  removable: true,
});

describe('applyOrder', () => {
  it('keeps the loaded order when nothing was saved', () => {
    const apps = [app('a'), app('b')];
    expect(applyOrder(apps, [])).toBe(apps);
  });

  it('follows the saved order and puts new apps at the end in their loaded order', () => {
    const ids = applyOrder([app('a'), app('new1'), app('b'), app('new2')], ['b', 'a']).map(
      (a) => a.id,
    );
    expect(ids).toEqual(['b', 'a', 'new1', 'new2']);
  });

  it('ignores saved ids of apps that are gone', () => {
    expect(applyOrder([app('a')], ['gone', 'a']).map((a) => a.id)).toEqual(['a']);
  });
});

describe('arrange', () => {
  it('shows every launch point, including hidden ones, and adds the Files and Settings tiles', () => {
    const apps = arrange([{ id: 'x.hidden' }, { id: 'x.visible', title: 'Visible' }]);
    const ids = apps.map((a) => a.id);
    expect(ids).toContain(FILES_TILE.id);
    expect(ids).toContain(SETTINGS_TILE.id);
    expect(ids).toContain('x.hidden');
    expect(apps.find((a) => a.id === 'x.hidden')?.title).toBe('x.hidden');
  });

  it("shows the logo of the device on an input instead of the input's icon", () => {
    const [ps5, hdmi1] = arrange([
      {
        id: 'hdmi2',
        title: 'PS5',
        largeIcon: 'hdmi.png',
        iconColor: '#6d757f',
        brandLogo: 'ps5.png',
      },
      { id: 'hdmi1', largeIcon: 'hdmi.png', iconColor: '#6d757f', brandLogo: '' },
    ]).filter((a) => a.id.startsWith('hdmi'));
    expect(ps5).toMatchObject({ title: 'PS5', icon: 'ps5.png', color: BRAND_COLOR });
    expect(hdmi1).toMatchObject({ icon: 'hdmi.png', color: '#6d757f' });
  });
});
