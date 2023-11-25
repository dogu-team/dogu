/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* @typescript-eslint/no-unsafe-member-access */

import { Device } from '@dogu-private/device-data';
import * as cheerio from 'cheerio';
import { Browser, Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { promisify } from 'util';

import { BrowserDriver } from './browser';

const wait = promisify(setTimeout);

export class Chrome extends BrowserDriver {
  constructor(device: Device) {
    super(device);
  }

  async build(): Promise<void> {
    const service = new chrome.ServiceBuilder();
    const options = new chrome.Options();

    service.loggingTo('chrome.log');
    service.enableVerboseLogging();
    service.build();

    // options.addArguments('--headless=new');
    options.addArguments('--disable-gpu');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--no-sandbox');
    // options.addArguments(`--window-size=${this.device.screen.viewportWidth * 2},${this.device.screen.viewportHeight * 2}`);
    options.addArguments(`--user-agent=${this.createUserAgent()}`);
    options.excludeSwitches('enable-automation');

    this.driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).setChromeService(service).build();
  }

  async render(): Promise<void> {
    await this.driver.executeScript(`document.body.style.overflow = 'hidden';`);
    await wait(1000);

    const cdp = await this.driver.createCDPConnection('page');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      mobile: true,
      width: this.device.screen.viewportWidth,
      height: this.device.screen.viewportHeight,
      deviceScaleFactor: 1.0,
      screenOrientation: {
        angle: 0,
        type: 'portraitPrimary',
      },
    });

    await this.driver.executeScript('window.scrollBy({left: 0, top: document.body.scrollHeight})');
    await wait(1000);
    await this.driver.executeScript('window.scrollTo({left: 0, top: 0});');
    await wait(1000);
  }

  async getUITexts(): Promise<{ xpath: string; text: string }[]> {
    const pageSource = await this.driver.getPageSource();
    const $ = cheerio.load(pageSource);
    const body = $('body')[0];

    const texts = await this.getElementTexts(body);
    return texts;
  }

  async takeScreenshot(): Promise<void> {
    const [cdp, clientWidth, innerWidth, clientHeight, innerHeight, staticMaxHeight] = await Promise.all([
      this.driver.createCDPConnection('page'),
      this.driver.executeScript('return document.documentElement.clientWidth') as Promise<number>,
      this.driver.executeScript('return window.innerWidth') as Promise<number>,
      this.driver.executeScript('return document.documentElement.clientHeight') as Promise<number>,
      this.driver.executeScript('return window.innerHeight') as Promise<number>,
      this.driver.executeScript('return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);') as Promise<number>,
    ]);

    const viewWidth = innerWidth - (innerWidth - clientWidth);
    const viewHeight: number = innerHeight - (innerHeight - clientHeight);
    let currentMaxHeight = staticMaxHeight;

    console.log(this.device.name, this.device.screen.viewportWidth, this.device.screen.viewportHeight);
    console.log('client size', clientWidth, clientHeight);
    console.log('inner size', innerWidth, innerHeight);
    console.log('max height', currentMaxHeight);

    let isDeletedFixedPositions = false;
    for (let currentY = 0; currentY < currentMaxHeight; currentY += viewHeight) {
      const clipViewHeight = currentY + viewHeight > currentMaxHeight ? currentMaxHeight % viewHeight : viewHeight;
      const screenshotConfig = {
        format: 'jpeg',
        quality: 100,
        captureBeyondViewport: true,
        fromSurface: true,
        clip: {
          width: viewWidth,
          height: clipViewHeight,
          x: 0,
          y: currentY,
          scale: 1,
        },
      };
      await this.driver.executeScript(`window.scrollTo(0, ${currentY})`);
      await wait(1000);

      const base64 = await cdp.send('Page.captureScreenshot', screenshotConfig);
      this.originalScreenShotsBase64.push(base64['result']['data']);

      currentMaxHeight = await this.driver.executeScript('return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);');

      if (!isDeletedFixedPositions) {
        await this.hideFixedElements();
        const maxHeight: number = await this.driver.executeScript('return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);');
        const fixedElementHeight = currentMaxHeight - maxHeight;

        currentY = currentY - fixedElementHeight;
        currentMaxHeight = maxHeight;
        isDeletedFixedPositions = true;
      }
    }
  }

  async hideFixedElements(): Promise<void> {
    await this.driver.executeScript(
      `
      const allElements = document.querySelectorAll('*');
      const fixedElements = [];

      for (const element of allElements) {
        elementPosition = window.getComputedStyle(element).position;

        if (elementPosition === 'fixed' || elementPosition === 'sticky') {
          fixedElements.push(element);
        }

        if (element.shadowRoot) {
          const shadowRoot = element.shadowRoot;
          const shadowElements = shadowRoot.querySelectorAll('*');

          for(const shadowElement of shadowElements) {
            const elementPosition = window.getComputedStyle(shadowElement).position;
            if (elementPosition === 'fixed' || elementPosition === 'sticky' ) {
              fixedElements.push(shadowElement);
            }
          }
        }
      }

      fixedElements.forEach(function(element) {
        element.style.opacity = 0;
      });
      `,
    );
  }
}
