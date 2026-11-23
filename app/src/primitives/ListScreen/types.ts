import type { ComponentChildren } from 'preact';

export interface Props {
  title: string;
  preview: ComponentChildren;
  caption: string;
  children: ComponentChildren;
}
