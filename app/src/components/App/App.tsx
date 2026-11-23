import { useState } from 'preact/hooks';
import { I18nContext } from '../../hooks/useI18n/useI18n';
import { useRemote } from '../../hooks/useRemote/useRemote';
import { useSettings } from '../../hooks/useSettings/useSettings';
import { useStateRef } from '../../hooks/useStateRef/useStateRef';
import { Move } from '../../icons/Move';
import { Trash } from '../../icons/Trash';
import { launchApp } from '../../lib/apps/apps';
import type { AppInfo } from '../../lib/apps/types';
import { colOf, moveFocus, rowOf } from '../../lib/gridNav/gridNav';
import { errorText } from '../../lib/luna/luna';
import { Key } from '../../lib/remote/constants';
import { isBack } from '../../lib/remote/remote';
import { ConfirmDialog } from '../../primitives/ConfirmDialog/ConfirmDialog';
import { ContextMenu } from '../../primitives/ContextMenu/ContextMenu';
import { Toast } from '../../primitives/Toast/Toast';
import { AppGrid } from '../AppGrid/AppGrid';
import { Files } from '../Files/Files';
import { Hero } from '../Hero/Hero';
import { Settings } from '../Settings/Settings';
import { TopBar } from '../TopBar/TopBar';
import styles from './App.module.css';
import type { Mode } from './types';
import { GRID, HOLD_MS, PRESS_MS, STEPS } from './constants';
import { useHomeApps, useLanguage, useOkHold, useToast } from './hooks';

export function App() {
  const [toast, showToast] = useToast();
  const [settings, updateSettings] = useSettings();
  const i18n = useLanguage(settings.language);
  const { t } = i18n;
  const [focus, setFocus, focusRef] = useStateRef(0);
  const [pressed, setPressed] = useState(-1);
  const [mode, setMode, modeRef] = useStateRef<Mode>(GRID);

  const goHome = () => {
    setMode(GRID);
    // The top row, same column.
    setFocus(colOf);
  };
  const { apps, move, remove } = useHomeApps({
    onError: (err) => showToast(t('home.cantLoadApps', { error: errorText(err) })),
    onRelaunch: goHome,
  });

  // A menu, move or confirmation whose app left the list falls back to the grid.
  const target = 'id' in mode ? apps.find((app) => app.id === mode.id) : undefined;
  const active: Mode = 'id' in mode && !target ? GRID : mode;
  const overlayOpen = active.kind === 'settings' || active.kind === 'files';

  const index = Math.min(focus, Math.max(apps.length - 1, 0));
  const row = rowOf(index);
  const scrolled = row > 0;

  // The pointer never scrolls between the top row and the rest: only the Down/Up keys do.
  const inSection = (i: number) => rowOf(i) > 0 === scrolled;

  const activate = (i: number) => {
    const app = apps[i];
    if (!app) return;
    setPressed(i);
    setTimeout(() => setPressed(-1), PRESS_MS);
    if (app.internal) {
      setMode({ kind: app.internal });
      return;
    }
    launchApp(app).catch((err: unknown) =>
      showToast(t('home.cantOpen', { name: app.title, error: errorText(err) })),
    );
  };

  const startOk = useOkHold(
    HOLD_MS,
    () => activate(Math.min(focusRef.current, apps.length - 1)),
    () => {
      const app = apps[Math.min(focusRef.current, apps.length - 1)];
      if (!app) return false;
      setMode({ kind: 'menu', id: app.id });
      return true;
    },
  );

  const deleteApp = (app: AppInfo) => {
    setMode(GRID);
    remove(app).catch((err: unknown) =>
      showToast(t('home.cantDelete', { name: app.title, error: errorText(err) })),
    );
  };

  // Carries the app being moved one step; focus follows it.
  const shift = (id: string, dx: number, dy: number) => {
    const from = apps.findIndex((app) => app.id === id);
    const to = moveFocus(from, dx, dy, apps.length);
    if (from < 0 || to === from) return;
    move(from, to);
    setFocus(to);
  };

  const menuActions = (app: AppInfo) => [
    { id: 'move', label: t('home.move'), icon: Move },
    ...(app.removable
      ? [{ id: 'delete', label: t('common.delete'), icon: Trash, destructive: true }]
      : []),
  ];

  useRemote(
    (e) => {
      const code = e.keyCode;
      const current = modeRef.current;

      if (current.kind === 'moving') {
        const step = STEPS[code];
        if (step) shift(current.id, ...step);
        else if ((code === Key.Ok || isBack(code)) && !e.repeat) setMode(GRID);
        return true;
      }

      const step = STEPS[code];
      if (step) {
        setFocus((f) => moveFocus(Math.min(f, apps.length - 1), ...step, apps.length));
        return true;
      }
      if (code === Key.Ok) {
        if (!e.repeat) startOk();
        return true;
      }
      if (isBack(code)) {
        setFocus(colOf);
        return true;
      }
      return false;
    },
    active.kind === 'grid' || active.kind === 'moving',
  );

  return (
    <I18nContext.Provider value={i18n}>
      <div class={styles.stage}>
        <Hero wallpaper={settings.wallpaper} dimmed={scrolled} hidden={overlayOpen} />
        <TopBar
          weatherPlace={settings.weatherEnabled ? settings.weatherPlace : null}
          temperatureUnit={settings.temperatureUnit}
          clockFormat={settings.clockFormat}
          showWeekday={settings.showWeekday}
          showDate={settings.showDate}
          faded={scrolled}
          hidden={overlayOpen}
        />
        <AppGrid
          apps={apps}
          focus={overlayOpen ? -1 : index}
          row={row}
          pressed={pressed}
          moving={active.kind === 'moving' && target ? apps.indexOf(target) : -1}
          hidden={overlayOpen}
          menuIndex={active.kind === 'menu' && target ? apps.indexOf(target) : -1}
          menu={
            target && (
              <ContextMenu
                actions={menuActions(target)}
                onSelect={(i) => {
                  if (menuActions(target)[i].id === 'move') {
                    setMode({ kind: 'moving', id: target.id });
                    showToast(t('home.moveHint'));
                  } else setMode({ kind: 'confirm', id: target.id });
                }}
                onClose={() => setMode(GRID)}
              />
            )
          }
          onPointerFocus={(i) => {
            if (active.kind !== 'grid' || !inSection(i)) return;
            setFocus(i);
          }}
          onPointerActivate={(i) => {
            if (active.kind === 'moving') return setMode(GRID);
            if (!inSection(i)) return;
            setFocus(i);
            activate(i);
          }}
        />
        {active.kind === 'settings' && (
          <Settings settings={settings} onChange={updateSettings} onClose={() => setMode(GRID)} />
        )}
        {active.kind === 'files' && (
          <Files
            audioLanguage={settings.audioLanguage}
            subtitleLanguage={settings.subtitleLanguage}
            onClose={() => setMode(GRID)}
            onError={showToast}
          />
        )}
        {active.kind === 'confirm' && target && (
          <ConfirmDialog
            title={t('home.deleteTitle', { name: target.title })}
            text={t('home.deleteText', { name: target.title })}
            confirmLabel={t('common.delete')}
            cancelLabel={t('common.cancel')}
            destructive
            onConfirm={() => deleteApp(target)}
            onCancel={() => setMode(GRID)}
          />
        )}
        <Toast text={toast} />
      </div>
    </I18nContext.Provider>
  );
}
