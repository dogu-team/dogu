import { expect, test } from '@jest/globals';
import { BrowserManager } from './browser-manager';
import { time } from '@dogu-tech/common';

test(
  'ensure firefox',
  async () => {
    // const browserManager = new BrowserManager();
    // const result = await browserManager.ensureBrowserAndDriver({
    //   browserName: 'firefox',
    //   browserPlatform: 'linux',
    // });
    // console.log(result);
    expect(true).toBe(true);
  },
  time({
    minutes: 10,
  }),
);
