export interface VideoSource {
  src: string;
  type: string;
}

export interface Track {
  index: number;
  label: string;
  language: string | null;
}

export interface Tracks {
  audio: Track[];
  subtitles: Track[];
}

// The parts of the media server's sourceInfo we read (umsmediainfo event).
export interface RawTrack {
  language?: string;
  description?: string;
  codec?: string;
  channels?: number;
}

export interface SourceInfo {
  type?: string;
  info?: { programInfo?: { audioTrackInfo?: RawTrack[]; subtitleTrackInfo?: RawTrack[] }[] };
}

// webOS extensions of the video element.
export type WebOSVideo = HTMLVideoElement & { mediaId?: string; send?(command: string): boolean };
