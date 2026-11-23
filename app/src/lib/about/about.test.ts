import { describe, expect, it } from 'vitest';
import { ipOf } from './about';

const up = (ipAddress: string) => ({ state: 'connected', ipAddress });
const down = { state: 'disconnected' };

describe('ipOf', () => {
  it('takes the link that is connected', () => {
    expect(ipOf({ wired: down, wifi: up('192.168.1.5') })).toBe('192.168.1.5');
    expect(ipOf({ wired: up('192.168.1.6'), wifi: down })).toBe('192.168.1.6');
  });

  it('prefers the cable', () => {
    expect(ipOf({ wired: up('192.168.1.6'), wifi: up('192.168.1.5') })).toBe('192.168.1.6');
  });

  it('is empty without a connection', () => {
    expect(ipOf({ wired: down, wifi: { state: 'connected' } })).toBe('');
    expect(ipOf({})).toBe('');
  });
});
