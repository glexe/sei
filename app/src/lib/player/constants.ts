import type { MessageKey } from '../i18n/types';

// LG Media Player's own option for USB files: the system media server reads the file and decodes it in hardware.
export const MEDIA_OPTION = {
  mediaTransportType: 'USB',
  htmlMediaOption: { useDassControl: true },
};

export const MEDIA_SERVICE = 'luna://com.webos.media';

export const CHANNELS: Record<number, string> = { 6: '5.1', 8: '7.1' };

export const CHANNEL_NAMES: Partial<Record<number, MessageKey>> = {
  1: 'player.mono',
  2: 'player.stereo',
};

// LG Media Player's scale: 0 Very Small, 1 Small, 2 Normal (default), 3 Big, 4 Very Big.
export const SUBTITLE_SIZE = 0;
