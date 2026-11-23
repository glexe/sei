export interface Props {
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  // Paints the confirm button red, for deleting.
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
