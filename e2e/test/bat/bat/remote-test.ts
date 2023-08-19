import { job, test } from '@dogu-tech/dest';
import { PlaywrightDriver } from '../../../src/playwright-driver';

export interface TestRemoteOptions {
  consoleFrontDriver: PlaywrightDriver;
}

export default function testRemote(options: TestRemoteOptions): void {
  job('Remote test', () => {
    test('Checkout dogu-examples', async () => {});
  });
}
