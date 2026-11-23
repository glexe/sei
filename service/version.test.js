import { expect, it } from 'vitest';
import root from '../package.json';
import host from '../tv/host/appinfo.json';
import service from './package.json';

// Home's own appinfo stays at 99: that is how it outranks LG's.
it('releases the service and its package under one version', () => {
  expect([service.version, host.version]).toEqual([root.version, root.version]);
});
