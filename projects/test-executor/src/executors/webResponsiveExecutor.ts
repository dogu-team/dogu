import { getDevicesByDisplay, Vendor } from '@dogu-private/device-data';
import { BucketName, GCP } from '@dogu-private/sdk';
import { Sharp } from 'sharp';
import { promisify } from 'util';

import { BrowserDriver } from '../browsers/browser';
import { Chrome } from '../browsers/chrome';

const wait = promisify(setTimeout);

export module WebResponsiveExecutor {
  const MAX_PARALLEL = process.env.MAX_PARALLEL !== undefined ? Number(process.env.MAX_PARALLEL) : 8;
  let organizationId: string;

  export async function run(args: { organizationId: string; testExecutorId: string; urls: string[] }): Promise<void> {
    const vendors = process.argv[4].split(';') as Vendor[];
    organizationId = args.organizationId;

    for (const url of args.urls) {
      const browsers: BrowserDriver[] = [];
      const images: { [display: string]: Sharp } = {};

      const devicesByDisplay = getDevicesByDisplay(vendors);
      for (const deviceByDisplay in devicesByDisplay) {
        const [width, height] = deviceByDisplay.split('x');
        const device = devicesByDisplay[deviceByDisplay][0];

        const deviceChromeBrowser = new Chrome(device, Number(width), Number(height), 1);
        browsers.push(deviceChromeBrowser);
      }

      await runChecker(browsers, images, url);

      const uploadImages: Promise<void>[] = [];
      for (const imageName in images) {
        const image = images[imageName];
        uploadImages.push(uploadImage(image, imageName, args.testExecutorId, url));
      }

      await Promise.all(uploadImages);

      console.log(JSON.stringify(devicesByDisplay, null, 2));
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

  async function uploadImage(image: Sharp, imageName: string, testExecutorId: string, url: string) {
    const urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '');
    const filePath = `web-responsive/${organizationId}/${testExecutorId}/${urlWithoutProtocol}/${imageName}.jpeg`;
    const buffer = await image.toBuffer();

    await GCP.putImage(BucketName.TEST_EXECUTOR, filePath, buffer, 'image/jpeg');
  }
}
