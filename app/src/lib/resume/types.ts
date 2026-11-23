export interface Entry {
  // 0 once the file was watched to the end, so it starts over.
  time: number;
  // Missing in entries saved before durations were kept.
  duration?: number;
  at: number;
  // Stays set when the file is played again.
  watched?: boolean;
}

export type Positions = Record<string, Entry>;

export interface Drive {
  positions: Positions;
  // Changed since the last write to the drive.
  dirty: boolean;
  flushedAt: number;
}

export interface Playback {
  watched: boolean;
  // Share played and seconds left, while a file is part way through.
  progress?: number;
  remaining?: number;
}
