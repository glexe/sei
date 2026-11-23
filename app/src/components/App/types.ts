// What the home screen is doing; one value, so illegal combinations (a menu over Settings) can't exist.
export type Mode =
  | { kind: 'grid' }
  | { kind: 'menu'; id: string }
  | { kind: 'moving'; id: string }
  | { kind: 'confirm'; id: string }
  | { kind: 'settings' }
  | { kind: 'files' };
