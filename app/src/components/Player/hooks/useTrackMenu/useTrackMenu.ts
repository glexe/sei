import { useEffect, useRef, useState } from 'preact/hooks';
import type { RefObject } from 'preact';
import type { MenuItem } from '../../../../primitives/TrackMenu/types';
import { useI18n } from '../../../../hooks/useI18n/useI18n';
import { parseTracks, selectAudio, selectSubtitles } from '../../../../lib/player/player';
import type { Tracks, WebOSVideo } from '../../../../lib/player/types';
import { useStateRef } from '../../../../hooks/useStateRef/useStateRef';
import type { Menu, TrackMenuState, TrackPrefs } from './types';

export function useTrackMenu(
  videoRef: RefObject<WebOSVideo | null>,
  prefs: TrackPrefs,
): TrackMenuState {
  const i18n = useI18n();
  const [tracks, setTracks] = useState<Tracks>({ audio: [], subtitles: [] });
  const [audio, setAudio] = useState(0);
  const [subtitle, setSubtitle, subtitleRef] = useStateRef<number | null>(null);
  const [menu, setMenu, menuRef] = useStateRef<Menu | null>(null);
  const [focus, setFocus, focusRef] = useStateRef(0);
  const pickedRef = useRef(false);

  // First match of the preferred languages, once per file; later picks are the viewer's.
  const pick = (video: WebOSVideo, next: Tracks) => {
    pickedRef.current = true;
    const a = prefs.audio ? next.audio.findIndex((t) => t.language === prefs.audio) : -1;
    if (a > 0) {
      setAudio(a);
      void selectAudio(video, a).catch(() => {});
    }
    const s = prefs.subtitle ? next.subtitles.find((t) => t.language === prefs.subtitle) : null;
    setSubtitle(s ? s.index : null);
  };

  useEffect(() => {
    const video = videoRef.current;
    // The media server reports tracks only through this webOS event, possibly more than once.
    const onInfo = (e: Event) => {
      const next = parseTracks(String((e as CustomEvent).detail), i18n);
      if (!next || !video) return;
      setTracks(next);
      if (!pickedRef.current) pick(video, next);
      selectSubtitles(video, subtitleRef.current);
    };
    video?.addEventListener('umsmediainfo', onInfo);
    return () => video?.removeEventListener('umsmediainfo', onInfo);
  }, []);

  const items = (which: Menu): MenuItem[] => {
    if (which === 'audio') {
      return tracks.audio.length
        ? tracks.audio.map((t) => ({ label: t.label, checked: t.index === audio }))
        : [{ label: i18n.t('common.default'), checked: true }];
    }
    return [
      { label: i18n.t('common.off'), checked: subtitle === null },
      ...tracks.subtitles.map((t) => ({ label: t.label, checked: t.index === subtitle })),
    ];
  };

  const open = (which: Menu | null) => {
    setMenu(which);
    if (which)
      setFocus(
        Math.max(
          items(which).findIndex((item) => item.checked),
          0,
        ),
      );
  };

  const choose = (i: number) => {
    const video = videoRef.current;
    if (!video || !menuRef.current) return;
    if (menuRef.current === 'audio') {
      if (tracks.audio.length) {
        setAudio(i);
        void selectAudio(video, i).catch(() => {});
      }
    } else {
      const next = i === 0 ? null : i - 1;
      setSubtitle(next);
      selectSubtitles(video, next);
    }
    open(null);
  };

  return { tracks, menu, menuRef, focus, setFocus, focusRef, items, open, choose };
}
