import type { RowData } from '../Row/types';

// Focus owned by the screen around the list (useNavStack keeps it per screen).
export interface ListFocus {
  focus: number | null;
  onFocus: (index: number) => void;
}

export interface Props<R extends RowData> {
  section?: string;
  rows: R[];
  focus: number;
  onFocus: (index: number) => void;
  onSelect: (row: R, index: number) => void;
  onBack: () => void;
}
