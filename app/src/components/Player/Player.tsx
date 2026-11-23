import { useEffect, useRef, useState } from 'preact/hooks';
import { useI18n } from '../../hooks/useI18n/useI18n';
import { useRemote } from '../../hooks/useRemote/useRemote';
import { useStateRef } from '../../hooks/useStateRef/useStateRef';
import { Pause } from '../../icons/Pause';
import { Play } from '../../icons/Play';
import { SkipBack } from '../../icons/SkipBack';
import { SkipForward } from '../../icons/SkipForward';
import { cx } from '../../lib/cx/cx';
import { formatTime, titleOf, videoSource } from '../../lib/player/player';
import type { WebOSVideo } from '../../lib/player/types';
import { flushDrive, resumeTime, saveTime } from '../../lib/resume/resume';
import { SAVE_EVERY_S } from '../../lib/resume/constants';
import { Key } from '../../lib/remote/constants';
import { isBack } from '../../lib/remote/remote';
import { TrackMenu } from '../../primitives/TrackMenu/TrackMenu';
import styles from './Player.module.css';
import type { Area, Props } from './types';
import { AREAS, HIDE_MS, PLAY_INDEX, SKIP_S, TOOLS } from './constants';
import { useAutoHide, useTrackMenu } from './hooks';

export function Player(props: Props) {
  const { name, path, root, rel, audioLanguage, subtitleLanguage, onClose } = props;
  const { t } = useI18n();
  const videoRef = useRef<WebOSVideo>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const [area, setArea, areaRef] = useStateRef<Area>('center');
  const [index, setIndex, indexRef] = useStateRef(PLAY_INDEX);
  const menu = useTrackMenu(videoRef, { audio: audioLanguage, subtitle: subtitleLanguage });
  const [visible, poke, show, visibleRef] = useAutoHide(
    HIDE_MS,
    () => !!videoRef.current && !videoRef.current.paused && !menu.menuRef.current,
  );
  // Read once: a new mediaOption would reload the video.
  const [source] = useState(() => videoSource(path, rel ? resumeTime(root, rel) : 0));
  const savedAtRef = useRef(0);

  // `flush` writes to the drive now (pause, end, close); otherwise the history module batches writes.
  const save = (v: HTMLVideoElement, flush = false) => {
    savedAtRef.current = v.currentTime;
    if (!rel || !Number.isFinite(v.duration)) return;
    saveTime(root, rel, v.currentTime, v.duration);
    if (flush) flushDrive(root);
  };

  useEffect(() => {
    const video = videoRef.current;
    return () => video && save(video, true);
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  };

  const seek = (delta: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration);
    setTime(v.currentTime);
  };

  const go = (next: Area, i: number) => {
    setArea(next);
    setIndex(i);
  };

  // Magic Remote pointer focuses what it hovers, like the arrow keys.
  const hover = (next: Area, i: number) => () => {
    poke();
    if (areaRef.current !== next || indexRef.current !== i) go(next, i);
  };

  const press = () => {
    if (areaRef.current === 'center') {
      if (indexRef.current === 0) seek(-SKIP_S);
      else if (indexRef.current === 2) seek(SKIP_S);
      else toggle();
    } else if (areaRef.current === 'bar') {
      toggle();
    } else {
      menu.open(TOOLS[indexRef.current].id);
    }
  };

  const menuKey = (code: number): boolean => {
    const count = menu.items(menu.menuRef.current!).length;
    if (code === Key.Up) menu.setFocus((i) => Math.max(i - 1, 0));
    else if (code === Key.Down) menu.setFocus((i) => Math.min(i + 1, count - 1));
    else if (code === Key.Ok) menu.choose(menu.focusRef.current);
    else if (isBack(code) || code === Key.Left || code === Key.Right) menu.open(null);
    else return false;
    return true;
  };

  useRemote((e) => {
    const code = e.keyCode;
    if (menu.menuRef.current) {
      poke();
      return menuKey(code);
    }
    if (isBack(code)) {
      if (visibleRef.current && videoRef.current && !videoRef.current.paused) show(false);
      else onClose();
      return true;
    }
    if (code === Key.Play || code === Key.Pause) {
      toggle();
      poke();
      return true;
    }
    // With the controls hidden the first key acts directly, like on Apple TV.
    if (!visibleRef.current) {
      if (code === Key.Ok) toggle();
      else if (code === Key.Left) seek(-SKIP_S);
      else if (code === Key.Right) seek(SKIP_S);
      poke();
      return true;
    }
    poke();

    const row = AREAS.indexOf(areaRef.current);
    const size = areaRef.current === 'center' ? 3 : TOOLS.length;
    switch (code) {
      case Key.Up:
        if (row > 0) go(AREAS[row - 1], AREAS[row - 1] === 'center' ? PLAY_INDEX : 0);
        return true;
      case Key.Down:
        if (row < AREAS.length - 1) go(AREAS[row + 1], 0);
        return true;
      case Key.Left:
        if (areaRef.current === 'bar') seek(-SKIP_S);
        else setIndex((i) => Math.max(i - 1, 0));
        return true;
      case Key.Right:
        if (areaRef.current === 'bar') seek(SKIP_S);
        else setIndex((i) => Math.min(i + 1, size - 1));
        return true;
      case Key.Ok:
        if (!e.repeat) press();
        return true;
      default:
        return false;
    }
  });

  const progress = duration > 0 ? time / duration : 0;
  const focused = (a: Area, i = 0) => area === a && (a === 'bar' || index === i);

  return (
    <div class={styles.player}>
      <video
        ref={videoRef}
        class={styles.video}
        autoPlay
        onPlay={() => {
          setPlaying(true);
          poke();
        }}
        onPause={(e) => {
          setPlaying(false);
          show(true);
          save(e.currentTarget, true);
        }}
        onEnded={(e) => save(e.currentTarget, true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setTime(v.currentTime);
          if (Math.abs(v.currentTime - savedAtRef.current) >= SAVE_EVERY_S) save(v);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setFailed(true)}
      >
        {source && <source src={source.src} type={source.type} onError={() => setFailed(true)} />}
      </video>

      <div class={cx(styles.controls, !visible && styles.hidden)}>
        {failed && <p class={styles.error}>{t('player.cantPlay')}</p>}

        <div class={styles.center}>
          <button
            class={cx(styles.round, focused('center', 0) && styles.focused)}
            aria-label={t('player.back10')}
            tabIndex={-1}
            onClick={() => seek(-SKIP_S)}
            onMouseMove={hover('center', 0)}
          >
            <SkipBack class={styles.skipIcon} />
            <span class={styles.skipLabel}>{SKIP_S}</span>
          </button>
          <button
            class={cx(styles.round, styles.big, focused('center', 1) && styles.focused)}
            aria-label={playing ? t('player.pause') : t('player.play')}
            tabIndex={-1}
            onClick={toggle}
            onMouseMove={hover('center', 1)}
          >
            {playing ? <Pause class={styles.playIcon} /> : <Play class={styles.playIcon} />}
          </button>
          <button
            class={cx(styles.round, focused('center', 2) && styles.focused)}
            aria-label={t('player.forward10')}
            tabIndex={-1}
            onClick={() => seek(SKIP_S)}
            onMouseMove={hover('center', 2)}
          >
            <SkipForward class={styles.skipIcon} />
            <span class={styles.skipLabel}>{SKIP_S}</span>
          </button>
        </div>

        <div class={styles.bottom}>
          <div class={styles.row}>
            <h1 class={styles.title}>{titleOf(name)}</h1>
            <div class={styles.tools}>
              {menu.menu && (
                <div class={styles.menu}>
                  <TrackMenu
                    title={menu.menu === 'audio' ? t('player.audio') : t('player.subtitles')}
                    items={menu.items(menu.menu)}
                    focus={menu.focus}
                    onHover={menu.setFocus}
                    onSelect={(i) => {
                      menu.setFocus(i);
                      menu.choose(i);
                    }}
                  />
                </div>
              )}
              {TOOLS.map((tool, i) => (
                <button
                  key={tool.id}
                  class={cx(styles.tool, focused('tools', i) && styles.focused)}
                  aria-label={t(tool.label)}
                  tabIndex={-1}
                  onClick={() => menu.open(tool.id)}
                  onMouseMove={hover('tools', i)}
                >
                  <tool.icon class={styles.toolIcon} />
                </button>
              ))}
            </div>
          </div>

          <div
            class={cx(styles.bar, focused('bar') && styles.barFocused)}
            onMouseMove={hover('bar', 0)}
          >
            <span class={styles.time}>{formatTime(time)}</span>
            <div class={styles.track} style={{ '--progress': progress }}>
              <div class={styles.fill} />
              <div class={styles.knobRail}>
                <div class={styles.knob} />
              </div>
            </div>
            <span class={styles.time}>-{formatTime(duration - time)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
