import { describe, expect, it } from 'vitest';
import { createI18n } from '../i18n/i18n';
import { formatTime, parseTracks } from './player';

describe('parseTracks', () => {
  it('reads tracks from umsmediainfo and normalizes ISO 639-2 languages', () => {
    const detail = JSON.stringify({
      type: 'sourceInfo',
      info: {
        programInfo: [
          {
            audioTrackInfo: [{ language: 'eng', codec: 'ac3', channels: 6 }, { language: 'ger' }],
            subtitleTrackInfo: [{ language: 'rus' }, {}],
          },
        ],
      },
    });
    const tracks = parseTracks(detail, createI18n('en'))!;
    expect(tracks.audio).toEqual([
      { index: 0, label: 'English · AC3 5.1', language: 'en' },
      { index: 1, label: 'German', language: 'de' },
    ]);
    expect(tracks.subtitles.map((t) => [t.label, t.language])).toEqual([
      ['Russian', 'ru'],
      ['Track 2', null],
    ]);
  });

  it('ignores other events and broken JSON', () => {
    expect(parseTracks('{"type":"other"}', createI18n('en'))).toBeNull();
    expect(parseTracks('{', createI18n('en'))).toBeNull();
  });
});

describe('formatTime', () => {
  it('shows hours only when needed', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(3725)).toBe('01:02:05');
    expect(formatTime(Number.NaN)).toBe('00:00');
  });
});
