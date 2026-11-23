import { cx } from '../../lib/cx/cx';
import styles from './IconPreview.module.css';
import type { Props } from './types';

export function IconPreview({ icon: Icon, dimmed, progress }: Props) {
  return (
    <div class={styles.preview}>
      <Icon class={cx(styles.icon, dimmed && styles.dimmed)} />
      {progress !== undefined && (
        <div class={styles.bar} style={{ '--progress': progress }}>
          <div class={styles.fill} />
        </div>
      )}
    </div>
  );
}
