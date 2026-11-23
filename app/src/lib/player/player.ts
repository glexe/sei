import { isWebOS, lunaCall } from '../luna/luna';
import type { I18n } from '../i18n/types';
import { CHANNEL_NAMES, CHANNELS, MEDIA_OPTION, MEDIA_SERVICE, SUBTITLE_SIZE } from './constants';
import { normalizeLanguage } from '../languages/languages';
import type { RawTrack, SourceInfo, Track, Tracks, VideoSource, WebOSVideo } from './types';

// The media server ignores early seeks, so a resume position goes into the option, as LG Media Player does.
export function videoSource(path: string, startS: number): VideoSource | null {
  if (!isWebOS()) return null;
  const option =
    startS > 0
      ? { transmission: { playTime: { realTime: false, start: Math.floor(startS * 1000) } } }
      : {};
  return {
    src: path.split('/').map(encodeURIComponent).join('/'),
    type:
      'video/mp4; mediaOption=' + encodeURIComponent(JSON.stringify({ ...MEDIA_OPTION, option })),
  };
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${String(h).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const titleOf = (name: string): string => name.replace(/\.[^.]+$/, '');

function channelsOf(count: number | undefined, { t }: I18n): string {
  if (!count) return '';
  const key = CHANNEL_NAMES[count];
  return key ? t(key) : (CHANNELS[count] ?? '');
}

function label(track: RawTrack, index: number, audio: boolean, i18n: I18n): string {
  const name =
    track.description ||
    i18n.languageName(normalizeLanguage(track.language)) ||
    i18n.t('player.track', { n: index + 1 });
  if (!audio) return name;
  const extra = [track.codec?.toUpperCase(), channelsOf(track.channels, i18n)]
    .filter(Boolean)
    .join(' ');
  return extra ? `${name} · ${extra}` : name;
}

const track = (raw: RawTrack, index: number, audio: boolean, i18n: I18n): Track => ({
  index,
  label: label(raw, index, audio, i18n),
  language: normalizeLanguage(raw.language),
});

// detail of the video element's umsmediainfo event, a JSON string.
export function parseTracks(detail: string, i18n: I18n): Tracks | null {
  let data: SourceInfo;
  try {
    data = JSON.parse(detail) as SourceInfo;
  } catch {
    return null;
  }
  const program = data.type === 'sourceInfo' ? data.info?.programInfo?.[0] : undefined;
  if (!program) return null;
  return {
    audio: (program.audioTrackInfo ?? []).map((t, i) => track(t, i, true, i18n)),
    subtitles: (program.subtitleTrackInfo ?? []).map((t, i) => track(t, i, false, i18n)),
  };
}

export async function selectAudio(video: WebOSVideo, index: number): Promise<void> {
  if (!video.mediaId) return;
  await lunaCall(MEDIA_SERVICE + '/selectTrack', { mediaId: video.mediaId, type: 'audio', index });
}

// null turns subtitles off.
export function selectSubtitles(video: WebOSVideo, index: number | null): void {
  if (index !== null) {
    video.send?.(JSON.stringify({ command: 'SetInternalSubtitle', parameter: { index } }));
    video.send?.(
      JSON.stringify({ command: 'SetMediaSubtitleInfo', parameter: { fontSize: SUBTITLE_SIZE } }),
    );
  }
  video.send?.(
    JSON.stringify({ command: 'SetMediaSubtitleEnable', parameter: { enable: index !== null } }),
  );
}
