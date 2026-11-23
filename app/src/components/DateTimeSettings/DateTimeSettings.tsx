import { useI18n } from '../../hooks/useI18n/useI18n';
import { ClockFace } from '../../icons/ClockFace';
import { IconPreview } from '../../primitives/IconPreview/IconPreview';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { List } from '../../primitives/List/List';
import type { Props } from './types';

export function DateTimeSettings({ settings, focus, onFocus, onChange, onBack }: Props) {
  const { t } = useI18n();
  const h24 = settings.clockFormat === '24h';
  const rows = [
    { id: 'time24', label: t('dateTime.time24'), toggle: h24 },
    { id: 'showWeekday', label: t('dateTime.showWeekday'), toggle: settings.showWeekday },
    { id: 'showDate', label: t('dateTime.showDate'), toggle: settings.showDate },
  ];

  return (
    <ListScreen
      title={t('dateTime.title')}
      preview={<IconPreview icon={ClockFace} />}
      caption={t('dateTime.caption')}
    >
      <List
        rows={rows}
        focus={focus ?? 0}
        onFocus={onFocus}
        onSelect={(row) => {
          if (row.id === 'time24') onChange({ clockFormat: h24 ? '12h' : '24h' });
          else if (row.id === 'showWeekday') onChange({ showWeekday: !settings.showWeekday });
          else onChange({ showDate: !settings.showDate });
        }}
        onBack={onBack}
      />
    </ListScreen>
  );
}
