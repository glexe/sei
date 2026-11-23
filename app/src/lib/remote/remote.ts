import { Key } from './constants';

export function isBack(keyCode: number): boolean {
  return keyCode === Key.Back || keyCode === Key.Backspace || keyCode === Key.Escape;
}
