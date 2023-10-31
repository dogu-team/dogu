import { Sharp } from 'sharp';
import { promisify } from 'util';

import { deviceArrayByDisplay } from '@dogu-private/device-data';
import { BrowserDriver } from '../browsers/browser';
import { Chrome } from '../browsers/chrome';
import { BucketName, GCP } from '../gcp/gcp';

const wait = promisify(setTimeout);

export module WebResponsiveService {
  const MAX_PARALLEL = 8;

  const browsers: BrowserDriver[] = [];
  const waitQueue: { [display: string]: Promise<Sharp> } = {};
  const images: { [display: string]: Sharp } = {};

  export async function run(): Promise<void> {
    for (const deviceByDisplay in deviceArrayByDisplay) {
      const [width, height] = deviceByDisplay.split('x');
      const device = deviceArrayByDisplay[deviceByDisplay][0];

      const deviceChromeBrowser = new Chrome(device, Number(width), Number(height), 1);
      browsers.push(deviceChromeBrowser);
    }

    await runChecker();

    const historyId = Math.random().toString(36).slice(-8);
    const uploadImages: Promise<void>[] = [];

    for (const imageName in images) {
      const image = images[imageName];
      uploadImages.push(uploadImage(image, imageName, historyId));
    }

    await Promise.all(uploadImages);

    console.log(JSON.stringify(deviceArrayByDisplay, null, 2));
  }

  async function captureFullScreen(browser: BrowserDriver): Promise<Sharp> {
    await browser.build();
    await browser.open(process.env.URL);
    await browser.render();
    await browser.takeScreenshot();
    await browser.close();

    const image = await browser.mergeVertically();
    return image;
  }

  async function runChecker() {
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

      const display = `${browser.device.screen.viewportWidth}x${browser.device.screen.viewportHeight}`;
      waitQueue[browser.device.name] = captureFullScreen(browser);
      waitQueue[browser.device.name]
        .then((image) => {
          images[display] = image;
        })
        .catch((error) => {
          // Need to handle
          console.log(browser.device.name);
          console.error(error);
        })
        .finally(() => {
          delete waitQueue[browser.device.name];
        });
    }

    await Promise.all(
      Object.keys(waitQueue).map((key) => {
        return waitQueue[key];
      }),
    );
  }

  async function uploadImage(image: Sharp, imageName: string, historyId: string) {
    const organizationId = process.env.ORGANIZATION_ID;
    const name = imageName;
    const filePath = `${organizationId}/${historyId}/${name}.jpg`;
    const buffer = await image.toBuffer();

    await GCP.putImage(BucketName.WEB_RESPONSIVE_PAGE, filePath, buffer, 'image/jpeg');
  }
}
