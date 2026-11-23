import styles from './ListScreen.module.css';
import type { Props } from './types';

export function ListScreen({ title, preview, caption, children }: Props) {
  return (
    <div class={styles.layout}>
      <h1 class={styles.title}>{title}</h1>
      <div class={styles.aside}>
        <div class={styles.preview}>{preview}</div>
        <p class={styles.caption}>{caption}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
