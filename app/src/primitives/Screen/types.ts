import type { ComponentChildren } from 'preact';

export interface Props {
  children: ComponentChildren;
  // The viewer went back, so content comes from the left.
  back?: boolean;
}
