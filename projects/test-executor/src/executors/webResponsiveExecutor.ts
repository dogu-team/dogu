/* eslint-disable @typescript-eslint/promise-function-async */
import { getDevicesByDisplay, Vendor } from '@dogu-private/device-data';
import { BucketName, GCP } from '@dogu-private/sdk';
import os from 'os';
import sharp, { Sharp } from 'sharp';
import { promisify } from 'util';

import { BrowserDriver } from '../browsers/browser';
import { Chrome } from '../browsers/chrome';
import { Executor } from './executor';
import { WebResponsiveImages } from './type';

const wait = promisify(setTimeout);

export class WebResponsiveExecutor extends Executor {
  private organizationId = '';
  private testExecutorId = '';
  private urls: string[] = [];
  private vendors: Vendor[] = [];

  constructor() {
    super();
  }

  init(): void {
    this.organizationId = process.argv[2];
    this.testExecutorId = process.argv[3];
    this.urls = process.argv[4].split('^');
    this.vendors = process.argv[5].split('^') as Vendor[];

    console.log('ORGANIZATION ID:', this.organizationId);
    console.log('TEST EXECUTOR ID:', this.testExecutorId);
    console.log('URLS:', this.urls);
    console.log('VENDORS:', this.vendors);
  }

  async run(): Promise<void> {
    const browsersQueue: { driver: BrowserDriver; url: string }[] = [];
    const images: WebResponsiveImages = {};

    for (const url of this.urls) {
      const devicesByDisplay = getDevicesByDisplay(this.vendors);
      for (const deviceByDisplay in devicesByDisplay) {
        const device = devicesByDisplay[deviceByDisplay][0];

        const driver = new Chrome(device);
        browsersQueue.push({ driver, url });
      }
    }

    const runningBrowserMap: { [key: string]: Promise<Sharp> } = {};
    while (browsersQueue.length > 0) {
      if (process.env.GOOGLE_CLOUD_RUN === 'true') {
        const totalMemoryMB = Number((os.totalmem() / 1024 / 1024).toFixed(2));
        const freeMemoryMB = Number((os.freemem() / 1024 / 1024).toFixed(2));
        const needToWaitForMemory = totalMemoryMB / 6 > freeMemoryMB;
        if (needToWaitForMemory) {
          console.log(`Total Memory: ${totalMemoryMB} MB`);
          console.log(`Free Memory: ${freeMemoryMB} MB`);
          continue;
        }
      }

      const MAX_PARALLEL = process.env.MAX_PARALLEL !== undefined ? Number(process.env.MAX_PARALLEL) : 8;
      if (Object.keys(runningBrowserMap).length < MAX_PARALLEL) {
        const browser = browsersQueue.shift();
        if (!browser) {
          continue;
        }

        const { driver, url } = browser;
        const display = `${driver.device.screen.viewportWidth}x${driver.device.screen.viewportHeight}`;
        const runningBrowserKey = `${url}x${display}`;

        runningBrowserMap[runningBrowserKey] = this.runBrowser(driver, images, url)
          .then((image) => {
            if (images[url] === undefined) {
              images[url] = {};
            }

            images[url][display] = image;
            return image;
          })
          .catch((error) => {
            console.log(driver.device.name);
            console.log(error);

            return sharp();
          })
          .finally(() => {
            if (!driver.isClosed) {
              void driver.close();
            }

            delete runningBrowserMap[runningBrowserKey];
          });
      } else {
        const runningBrowsers: Promise<Sharp>[] = Object.values(runningBrowserMap);
        await Promise.race(runningBrowsers);
      }

      await wait(1000);
    }

    const runningBrowsers: Promise<Sharp>[] = Object.values(runningBrowserMap);
    await Promise.all(runningBrowsers);

    const uploadImages: Promise<void>[] = [];
    for (const url in images) {
      for (const display in images[url]) {
        const imageName = display.replace('x', 'x');
        const image = images[url][display];

        uploadImages.push(this.uploadImage(image, imageName, this.testExecutorId, url));
      }
    }

    await Promise.all(uploadImages);
  }

  async runBrowser(browser: BrowserDriver, images: WebResponsiveImages, url: string): Promise<Sharp> {
    const display = `${browser.device.screen.viewportWidth}x${browser.device.screen.viewportHeight}`;
    const fullScreenImage = await this.captureFullScreen(browser, url);

    return fullScreenImage;
  }

  async captureFullScreen(browser: BrowserDriver, url: string): Promise<Sharp> {
    await browser.build();
    await browser.open(url);
    await browser.render();
    await browser.takeScreenshot();
    await browser.close();

    const image = await browser.mergeVertically();
    return image;
  }

  async uploadImage(image: Sharp, imageName: string, testExecutorId: string, url: string): Promise<void> {
    const urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '');
    const filePath = `web-responsive/${this.organizationId}/${testExecutorId}/${urlWithoutProtocol}/${imageName}.jpeg`;
    const buffer = await image.toBuffer();

    await GCP.putImage(BucketName.TEST_EXECUTOR, filePath, buffer, 'image/jpeg');
  }
}
