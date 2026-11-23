import { useI18n } from '../../hooks/useI18n/useI18n';
import { Play } from '../../icons/Play';
import { IconPreview } from '../../primitives/IconPreview/IconPreview';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { List } from '../../primitives/List/List';
import type { Props } from './types';

export function PlayerSettings({ settings, focus, onFocus, onOpen, onBack }: Props) {
  const { t, languageName } = useI18n();
  const rows = [
    {
      id: 'audioLanguage' as const,
      label: t('player.audioLanguage'),
      value: languageName(settings.audioLanguage) || t('common.default'),
      chevron: true,
    },
    {
      id: 'subtitleLanguage' as const,
      label: t('player.subtitleLanguage'),
      value: languageName(settings.subtitleLanguage) || t('common.off'),
      chevron: true,
    },
  ];

  return (
    <ListScreen
      title={t('player.title')}
      preview={<IconPreview icon={Play} />}
      caption={t('player.caption')}
    >
      <List
        rows={rows}
        focus={focus ?? 0}
        onFocus={onFocus}
        onSelect={(row) => onOpen(row.id)}
        onBack={onBack}
      />
    </ListScreen>
  );
}
