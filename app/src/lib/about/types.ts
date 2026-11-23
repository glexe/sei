export type ServiceStatus =
  | { state: 'running'; version: string }
  // Answers, but Homebrew Channel hasn't elevated it.
  | { state: 'noRoot' }
  | { state: 'down' };

export interface TvInfo {
  model: string;
  webos: string;
}
