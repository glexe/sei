import type { ComponentChildren } from 'preact';

export interface Props {
  // Above the title, filling a rounded square.
  art?: ComponentChildren;
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  // Paints the confirm button red, for deleting.
  destructive?: boolean;
  // Hides the buttons while the answer is carried out.
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
