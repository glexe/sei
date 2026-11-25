import { useEffect, useState } from 'preact/hooks';
import { I18nContext } from '../../hooks/useI18n/useI18n';
import { useLanguage } from '../../hooks/useLanguage/useLanguage';
import { errorText } from '../../lib/luna/luna';
import { elevate, fetchPackage, installHome, reboot } from '../../lib/setup/setup';
import type { HomeState } from '../../lib/setup/types';
import { ConfirmDialog } from '../../primitives/ConfirmDialog/ConfirmDialog';
import { Stage } from '../../primitives/Stage/Stage';
import { AppIcon } from '../AppIcon/AppIcon';
import type { SetupState } from './types';

// What the package shows until Sei is the home screen; after that, opening it only leads home.
export function Setup() {
  const i18n = useLanguage(null);
  const { t } = i18n;
  const [state, setState] = useState<SetupState>({ kind: 'checking' });

  const follow = (home: HomeState) => {
    if (home === 'active') window.close();
    else setState({ kind: home === 'none' ? 'ready' : 'restart' });
  };

  useEffect(() => {
    fetchPackage().then(
      ({ home }) => follow(home),
      () => setState({ kind: 'ready' }),
    );
  }, []);

  const install = async () => {
    setState({ kind: 'installing' });
    try {
      await elevate();
    } catch (err) {
      console.error(err);
      return setState({ kind: 'failed', text: t('setup.noRoot') });
    }
    try {
      follow(await installHome());
    } catch (err) {
      setState({ kind: 'failed', text: t('setup.failed', { error: errorText(err) }) });
    }
  };

  const restart = () => {
    setState({ kind: 'restarting' });
    reboot().catch(() => setState({ kind: 'restart' }));
  };

  const text = () => {
    if (state.kind === 'failed') return state.text;
    if (state.kind === 'installing') return t('setup.installing');
    if (state.kind === 'restarting') return t('setup.restarting');
    return state.kind === 'restart' ? t('setup.restartCaption') : t('setup.caption');
  };

  if (state.kind === 'checking') return null;
  return (
    <I18nContext.Provider value={i18n}>
      <Stage>
        <ConfirmDialog
          art={<AppIcon />}
          title="Sei"
          text={text()}
          confirmLabel={state.kind === 'restart' ? t('setup.restart') : t('setup.install')}
          cancelLabel={t('common.cancel')}
          busy={state.kind === 'installing' || state.kind === 'restarting'}
          onConfirm={() => (state.kind === 'restart' ? restart() : void install())}
          onCancel={() => window.close()}
        />
      </Stage>
    </I18nContext.Provider>
  );
}
