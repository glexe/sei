import { useI18n } from '../../hooks/useI18n/useI18n';
import { WALLPAPERS } from '../../lib/wallpapers/wallpapers';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { List } from '../../primitives/List/List';
import { Wallpaper } from '../Wallpaper/Wallpaper';
import type { Props } from './types';

export function WallpaperPicker({ kind, selected, focus, onFocus, onSelect, onBack }: Props) {
  const { t, wallpaperTitle } = useI18n();
  const wallpapers = WALLPAPERS.filter((w) => w.kind === kind);
  const current =
    focus ??
    Math.max(
      0,
      wallpapers.findIndex((w) => w.id === selected),
    );
  const focused = wallpapers[Math.min(current, wallpapers.length - 1)];
  const rows = wallpapers.map((w) => ({
    id: w.id,
    label: wallpaperTitle(w),
    checked: w.id === selected,
  }));

  return (
    <ListScreen
      title={t(`wallpaper.${kind}`)}
      preview={<Wallpaper wallpaper={focused} thumb />}
      caption={wallpaperTitle(focused)}
    >
      <List
        rows={rows}
        focus={current}
        onFocus={onFocus}
        onSelect={(row) => onSelect(row.id)}
        onBack={onBack}
      />
    </ListScreen>
  );
}
