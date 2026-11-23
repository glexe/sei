import { AudioTrack } from '../../icons/AudioTrack';
import { Subtitles } from '../../icons/Subtitles';
import type { Area, Tool } from './types';

export const SKIP_S = 10;
export const HIDE_MS = 4000;

// Top to bottom, for Up/Down.
export const AREAS: Area[] = ['center', 'tools', 'bar'];

export const PLAY_INDEX = 1;

export const TOOLS: Tool[] = [
  { id: 'subtitles', label: 'player.subtitles', icon: Subtitles },
  { id: 'audio', label: 'player.audio', icon: AudioTrack },
];
