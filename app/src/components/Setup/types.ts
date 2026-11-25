export type SetupState =
  | { kind: 'checking' }
  | { kind: 'ready' }
  | { kind: 'installing' }
  // Installed; webOS starts it at the next boot.
  | { kind: 'restart' }
  | { kind: 'restarting' }
  | { kind: 'failed'; text: string };
