export interface NavEntry<S> {
  screen: S;
  // Focused row; null until the viewer moves, so the screen picks its own default (e.g. the checked row).
  focus: number | null;
}

export interface NavStack<S> {
  top: NavEntry<S>;
  // The last step was a pop.
  wentBack: boolean;
  depth: number;
  push: (screen: S) => void;
  pop: () => void;
  setFocus: (focus: number) => void;
}
