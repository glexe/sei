interface PalmServiceBridge {
  onservicecallback: ((response: string) => void) | null;
  call(uri: string, params: string): void;
  cancel(): void;
}

interface WebOSSystem {
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
