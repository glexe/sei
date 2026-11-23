import { describe, expect, it } from 'vitest';
import { playbackOf, withSaved } from './resume';

describe('resume positions', () => {
  it('ignores the first 30 seconds, so a closing video reporting 0 never erases a position', () => {
    const saved = withSaved({}, '/a.mkv', 600, 2400)!;
    expect(withSaved(saved, '/a.mkv', 0, 2400)).toBeNull();
    expect(saved['/a.mkv'].time).toBe(600);
  });

  it('marks a finished file watched and starts it over', () => {
    const saved = withSaved({}, '/a.mkv', 2390, 2400)!;
    expect(saved['/a.mkv'].time).toBe(0);
    expect(playbackOf(saved).get('/a.mkv')).toEqual({ watched: true });
  });

  it('keeps the watched mark while the file is played again', () => {
    const watched = withSaved({}, '/a.mkv', 2390, 2400)!;
    const again = withSaved(watched, '/a.mkv', 300, 2400)!;
    expect(playbackOf(again).get('/a.mkv')).toEqual({
      watched: true,
      progress: 0.125,
      remaining: 2100,
    });
  });

  it('keeps files apart by their whole path inside the drive', () => {
    const one = withSaved({}, '/Shows/1.mkv', 600, 2400)!;
    const both = withSaved(one, '/Shows2/1.mkv', 900, 2400)!;
    expect(both['/Shows/1.mkv'].time).toBe(600);
    expect(both['/Shows2/1.mkv'].time).toBe(900);
  });
});
