import { useI18n } from '../../hooks/useI18n/useI18n';
import { Gear } from '../../icons/Gear';
import { ENDONYMS } from '../../lib/languages/constants';
import { findWallpaper } from '../../lib/wallpapers/wallpapers';
import { IconPreview } from '../../primitives/IconPreview/IconPreview';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { List } from '../../primitives/List/List';
import type { Props, Section } from './types';

export function SettingsHome({ settings, focus, onFocus, onOpen, onClose }: Props) {
  const { t, wallpaperTitle } = useI18n();
  const rows = [
    {
      id: 'wallpaper',
      label: t('wallpaper.title'),
      value: wallpaperTitle(findWallpaper(settings.wallpaper)),
      chevron: true,
    },
    {
      id: 'weather',
      label: t('weather.title'),
      value: (settings.weatherEnabled && settings.weatherPlace?.name) || t('common.off'),
      chevron: true,
    },
    { id: 'player', label: t('player.title'), chevron: true },
    {
      id: 'language',
      label: t('language.title'),
      value: settings.language ? ENDONYMS[settings.language] : t('language.tv'),
      chevron: true,
    },
    { id: 'dateTime', label: t('dateTime.title'), chevron: true },
  ];
  return (
    <ListScreen
      title={t('settings.title')}
      preview={<IconPreview icon={Gear} />}
      caption={t('settings.caption')}
    >
      <List
        rows={rows}
        focus={focus ?? 0}
        onFocus={onFocus}
        onSelect={(row) => onOpen(row.id as Section)}
        onBack={onClose}
      />
    </ListScreen>
  );
}
