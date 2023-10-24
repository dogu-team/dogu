import { promisify } from 'util';
import { BrowserDriver } from '../browsers/browser';
import { Chrome } from '../browsers/chrome';
import { devices } from '../device/devices';

const wait = promisify(setTimeout);

const URL = 'https://dogutech.io/ko';
const MAX_PARALLEL = 5;

async function checkDisplaySize(browser: BrowserDriver) {
  await browser.build();
  await browser.open(URL);
  await browser.render();
  await browser.takeScreenshot();
  await browser.mergeVertically();
  await browser.close();
}

(async () => {
  const devicesByDisplay: { [display: string]: string[] } = {};
  const browsers: BrowserDriver[] = [];
  const waitQueue: { [key: string]: Promise<void> } = {};

  for (const deviceName in devices) {
    const device = devices[deviceName];
    const display = `${device.widthResolution / device.pixelRatio}x${device.heightResolution / device.pixelRatio}`;
    const deviceByDisplay = devicesByDisplay[display];

    if (deviceByDisplay) {
      deviceByDisplay.push(deviceName);
    } else {
      devicesByDisplay[display] = [deviceName];
    }
  }

  for (const display in devicesByDisplay) {
    const [width, height] = display.split('x');
    const deviceBrowser = new Chrome(display, Number(width), Number(height), 1);
    browsers.push(deviceBrowser);
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

    waitQueue[browser.driverName] = checkDisplaySize(browser);
    waitQueue[browser.driverName]
      .catch((error) => {
        console.log(browser.driverName);
        console.error(error);
      })
      .finally(() => {
        delete waitQueue[browser.driverName];
      });
  }
})();
