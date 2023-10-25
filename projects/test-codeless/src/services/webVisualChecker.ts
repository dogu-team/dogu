import { promisify } from 'util';
import { BrowserDriver } from '../browsers/browser';
import { Chrome } from '../browsers/chrome';
import { Device, devices } from '../device/devices';

const wait = promisify(setTimeout);

const URL = 'https://www.innoforest.co.kr/';
const MAX_PARALLEL = 8;

async function captureScreen(browser: BrowserDriver) {
  await browser.build();
  await browser.open(URL);
  await browser.render();
  await browser.takeScreenshot();
  await browser.mergeVertically();
  await browser.close();
}

(async () => {
  const devicesByDisplay: { [display: string]: Device[] } = {};
  const browsers: BrowserDriver[] = [];
  const waitQueue: { [display: string]: Promise<void> } = {};

  for (const device of devices) {
    const display = `${device.screen.viewportWidth}x${device.screen.viewportHeight}`;
    const deviceByDisplay = devicesByDisplay[display];

    if (deviceByDisplay) {
      deviceByDisplay.push(device);
    } else {
      devicesByDisplay[display] = [device];
    }
  }

  for (const deviceByDisplay in devicesByDisplay) {
    const [width, height] = deviceByDisplay.split('x');
    const device = devicesByDisplay[deviceByDisplay][0];

    const deviceChromeBrowser = new Chrome(device, Number(width), Number(height), 1);
    browsers.push(deviceChromeBrowser);
  }

  while (browsers.length !== 0) {
    await wait(1000);

    const waitQueueLength = Object.keys(waitQueue).length;
    if (waitQueueLength >= MAX_PARALLEL) {
      continue;
    }

    const browser = browsers.shift();
    if (!browser) {
      break;
    }

    waitQueue[browser.device.name] = captureScreen(browser);
    waitQueue[browser.device.name]
      .catch((error) => {
        console.log(browser.device.name);
        console.error(error);
      })
      .finally(() => {
        delete waitQueue[browser.device.name];
      });
  }

  console.log(JSON.stringify(devicesByDisplay, null, 2));
})();
