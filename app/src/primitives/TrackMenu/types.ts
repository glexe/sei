export interface MenuItem {
  label: string;
  checked: boolean;
}

export interface Props {
  title: string;
  items: MenuItem[];
  focus: number;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
}
