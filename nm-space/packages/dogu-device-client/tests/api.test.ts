import { expect, test } from '@jest/globals';
import { DeviceClient, DeviceHostClient } from '../src/index.js';

test('test api', async () => {
  const host = new DeviceHostClient({ port: 5001 });
  const hostPort = await host.getFreePort();

  const device = new DeviceClient({ port: 5001 });
  const appiumServer = await device.runAppiumServer('R39M20AQVAM');
  expect(appiumServer.port).toBeDefined();
  await appiumServer.close();

  const capabilities = await device.getAppiumCapabilities('R39M20AQVAM');
  expect(capabilities).toHaveProperty('platformName');

  const closer = await device.forward('R39M20AQVAM', hostPort, 12345);
  await closer.close();
});
