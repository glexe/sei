export interface Options {
  onError: (err: unknown) => void;
  onRelaunch: () => void;
}

export interface LaunchParams {
  launchType?: string;
}
