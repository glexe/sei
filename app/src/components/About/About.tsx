import { useEffect, useState } from 'preact/hooks';
import { version } from '../../../../package.json';
import { useI18n } from '../../hooks/useI18n/useI18n';
import { fetchIp, fetchService, fetchTv } from '../../lib/about/about';
import type { ServiceStatus, TvInfo } from '../../lib/about/types';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { List } from '../../primitives/List/List';
import { AppIcon } from '../AppIcon/AppIcon';
import type { Props } from './types';

export function About({ focus, onFocus, onBack }: Props) {
  const { t } = useI18n();
  const [service, setService] = useState<ServiceStatus | null>(null);
  const [tv, setTv] = useState<TvInfo | null>(null);
  const [ip, setIp] = useState('');

  useEffect(() => {
    void fetchService().then(setService);
    fetchTv().then(setTv, () => {});
    fetchIp().then(setIp, () => {});
  }, []);

  const serviceValue = () => {
    if (!service) return undefined;
    if (service.state === 'running') return service.version;
    return service.state === 'noRoot' ? t('about.noRoot') : t('about.notRunning');
  };

  const rows = [
    { id: 'version', label: t('about.version'), value: version },
    { id: 'service', label: t('about.service'), value: serviceValue() },
    { id: 'tv', label: t('about.tv'), value: tv?.model },
    { id: 'webos', label: 'webOS', value: tv?.webos },
    { id: 'ip', label: t('about.ip'), value: ip },
  ];

  return (
    <ListScreen title={t('about.title')} preview={<AppIcon />} caption="Sei">
      <List rows={rows} focus={focus ?? 0} onFocus={onFocus} onSelect={() => {}} onBack={onBack} />
    </ListScreen>
  );
}
