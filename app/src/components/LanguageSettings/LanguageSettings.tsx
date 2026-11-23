import { useI18n } from '../../hooks/useI18n/useI18n';
import { ENDONYMS, LANGUAGES } from '../../lib/languages/constants';
import { languageName } from '../../lib/languages/languages';
import { IconPreview } from '../../primitives/IconPreview/IconPreview';
import { ListScreen } from '../../primitives/ListScreen/ListScreen';
import { List } from '../../primitives/List/List';
import type { Props } from './types';

export function LanguageSettings(props: Props) {
  const { title, icon, caption, noneLabel, native, value, focus, onFocus, onSelect, onBack } =
    props;
  const { lang } = useI18n();
  const byName = LANGUAGES.map((code) => ({
    code,
    name: native ? ENDONYMS[code] : languageName(code, lang),
  })).sort((a, b) => a.name.localeCompare(b.name, lang));
  const rows = [
    { id: '', label: noneLabel, checked: value === null },
    ...byName.map(({ code, name }) => ({ id: code, label: name, checked: code === value })),
  ];

  return (
    <ListScreen title={title} preview={<IconPreview icon={icon} />} caption={caption}>
      <List
        rows={rows}
        focus={
          focus ??
          Math.max(
            rows.findIndex((r) => r.checked),
            0,
          )
        }
        onFocus={onFocus}
        onSelect={(row) => onSelect(row.id || null)}
        onBack={onBack}
      />
    </ListScreen>
  );
}
