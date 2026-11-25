import icon from '../../assets/icon.png';
import styles from './AppIcon.module.css';

// Sei's own icon, filling the preview block of a list screen.
export function AppIcon() {
  return <img class={styles.icon} src={icon} alt="" />;
}
