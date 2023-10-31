import { deviceArrayByDisplay } from '@dogu-private/device-data';
import { BucketName, GCP } from '@dogu-private/sdk';
import { Sharp } from 'sharp';
import { promisify } from 'util';

import { BrowserDriver } from '../browsers/browser';
import { Chrome } from '../browsers/chrome';

const wait = promisify(setTimeout);

export module WebResponsiveService {
  const MAX_PARALLEL = 4;

  export async function run(args: { urls: string[] }): Promise<void> {
    const { urls } = args;

    for (const url of urls) {
      const browsers: BrowserDriver[] = [];
      const images: { [display: string]: Sharp } = {};

      for (const deviceByDisplay in deviceArrayByDisplay) {
        const [width, height] = deviceByDisplay.split('x');
        const device = deviceArrayByDisplay[deviceByDisplay][0];

        const deviceChromeBrowser = new Chrome(device, Number(width), Number(height), 1);
        browsers.push(deviceChromeBrowser);
      }

      await runChecker(browsers, images, url);

      const historyId = Math.random().toString(36).slice(-8);
      const uploadImages: Promise<void>[] = [];

      for (const imageName in images) {
        const image = images[imageName];
        uploadImages.push(uploadImage(image, imageName, historyId, url));
      }

      await Promise.all(uploadImages);

      console.log(JSON.stringify(deviceArrayByDisplay, null, 2));
    }
  }

  async function captureFullScreen(browser: BrowserDriver, url: string): Promise<Sharp> {
    await browser.build();
    await browser.open(url);
    await browser.render();
    await browser.takeScreenshot();
    await browser.close();

    const image = await browser.mergeVertically();
    return image;
  }

  async function runChecker(browsers: BrowserDriver[], images: { [display: string]: Sharp }, url: string) {
    const waitQueue: { [display: string]: Promise<Sharp> } = {};

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
      waitQueue[browser.device.name] = captureFullScreen(browser, url);
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

  async function uploadImage(image: Sharp, imageName: string, historyId: string, url: string) {
    const organizationId = process.env.ORGANIZATION_ID;
    const urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '');
    const filePath = `${organizationId}/${historyId}/${urlWithoutProtocol}/${imageName}.jpg`;
    const buffer = await image.toBuffer();

    await GCP.putImage(BucketName.WEB_RESPONSIVE_PAGE, filePath, buffer, 'image/jpeg');
  }
}
