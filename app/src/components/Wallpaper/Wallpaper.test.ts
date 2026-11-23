import { expect, it } from 'vitest';
import { COLORS, GRADIENTS } from '../../lib/wallpapers/constants';
import styles from './Wallpaper.module.css';

it.each([...COLORS, ...GRADIENTS])('%s has a class to draw it', (id) => {
  expect(styles[id]).toBeTruthy();
});
