import { useI18n } from '../../hooks/useI18n/useI18n';
import { KINDS } from '../../lib/wallpapers/constants';
import { findWallpaper } from '../../lib/wallpapers/wallpapers';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { List } from '../../primitives/List/List';
import { Wallpaper } from '../Wallpaper/Wallpaper';
import type { Props } from './types';

export function WallpaperSettings({ settings, focus, onFocus, onOpen, onBack }: Props) {
  const { t, wallpaperTitle } = useI18n();
  const current = findWallpaper(settings.wallpaper);
  const rows = KINDS.map((kind) => ({
    id: kind,
    label: t(`wallpaper.${kind}`),
    value: kind === current.kind ? wallpaperTitle(current) : undefined,
    chevron: true,
  }));

  return (
    <ListScreen
      title={t('wallpaper.title')}
      preview={<Wallpaper wallpaper={current} thumb />}
      caption={wallpaperTitle(current)}
    >
      <List
        rows={rows}
        focus={focus ?? KINDS.indexOf(current.kind)}
        onFocus={onFocus}
        onSelect={(row) => onOpen(row.id)}
        onBack={onBack}
      />
    </ListScreen>
  );
}
