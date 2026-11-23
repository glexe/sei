import { useI18n } from '../../hooks/useI18n/useI18n';
import { Sun } from '../../icons/Sun';
import { IconPreview } from '../../primitives/IconPreview/IconPreview';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { List } from '../../primitives/List/List';
import type { Props } from './types';

export function WeatherSettings(props: Props) {
  const { settings, focus, onFocus, onChange, onOpenLocation, onBack } = props;
  const { t } = useI18n();
  const celsius = settings.temperatureUnit === 'celsius';
  const enabled = settings.weatherEnabled;

  // Like Apple settings: the switch comes first and hides the options it turns off.
  const rows = [
    { id: 'enabled', label: t('weather.title'), toggle: enabled },
    ...(enabled
      ? [
          {
            id: 'location',
            label: t('weather.location'),
            value: settings.weatherPlace?.name ?? t('weather.notSet'),
            chevron: true,
          },
          {
            id: 'unit',
            label: t('weather.units'),
            value: celsius ? t('weather.celsius') : t('weather.fahrenheit'),
          },
        ]
      : []),
  ];

  return (
    <ListScreen
      title={t('weather.title')}
      preview={<IconPreview icon={Sun} />}
      caption={t('weather.caption')}
    >
      <List
        rows={rows}
        focus={focus ?? 0}
        onFocus={onFocus}
        onSelect={(row) => {
          if (row.id === 'enabled') onChange({ weatherEnabled: !enabled });
          else if (row.id === 'location') onOpenLocation();
          else onChange({ temperatureUnit: celsius ? 'fahrenheit' : 'celsius' });
        }}
        onBack={onBack}
      />
    </ListScreen>
  );
}
