import { useI18n } from '../../hooks/useI18n/useI18n';
import { cx } from '../../lib/cx/cx';
import { Switch } from '../Switch/Switch';
import styles from './Row.module.css';
import type { Props } from './types';

export function Row(props: Props) {
  const {
    index,
    label,
    value,
    checked,
    chevron,
    toggle,
    icon: Icon,
    dimmed,
    focused,
    placed,
  } = props;
  const { t } = useI18n();
  return (
    <li
      class={cx(styles.row, focused && styles.focused, placed && styles.placed)}
      style={placed ? { '--slot': index } : undefined}
      data-index={index}
    >
      {Icon && <Icon class={cx(styles.icon, dimmed && styles.dimmed)} />}
      <span class={styles.label}>{label}</span>
      {value && <span class={styles.value}>{value}</span>}
      {checked && <span class={styles.check} aria-label={t('common.selected')} />}
      {chevron && <span class={styles.chevron} aria-hidden="true" />}
      {toggle !== undefined && <Switch on={toggle} label={label} />}
    </li>
  );
}
