interface PalmServiceBridge {
  onservicecallback: ((response: string) => void) | null;
  call(uri: string, params: string): void;
  cancel(): void;
}

interface WebOSSystem {
  // The app's id, with the process id after a space on older TVs.
  identifier?: string;
  launchParams?: string;
  locale?: string;
}

interface Window {
  PalmServiceBridge?: new () => PalmServiceBridge;
  webOSSystem?: WebOSSystem;
  PalmSystem?: WebOSSystem;
}

interface DocumentEventMap {
  webOSRelaunch: Event;
  webOSLocaleChange: Event;
}
