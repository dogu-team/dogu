import { Device } from '@dogu-private/device-data';
import path from 'path';
import { Browser, Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { promisify } from 'util';

import { BrowserDriver } from './browser';

const wait = promisify(setTimeout);

export class Chrome extends BrowserDriver {
  static customChromeDriverPath = path.join(__dirname, '../binary/chromedriver');

  constructor(device: Device, viewportWidth: number, viewportHeight: number, pixelRatio: number) {
    super(device, viewportWidth, viewportHeight, pixelRatio);
  }

  async build(): Promise<void> {
    const service = new chrome.ServiceBuilder();
    const options = new chrome.Options();

    service.loggingTo('chrome.log');
    service.enableVerboseLogging();
    service.build();

    options.addArguments('--headless=new');
    options.addArguments('--disable-gpu');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--no-sandbox');
    options.addArguments(`--window-size=${this.viewportWidth},${this.viewportHeight}`);
    options.addArguments(`--user-agent=${this.createUserAgent()}`);
    options.excludeSwitches('enable-automation');

    this.driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).setChromeService(service).build();
  }

  async takeScreenshot(): Promise<void> {
    const cdp = await this.driver.createCDPConnection('page');
    const clientWidth: number = await this.driver.executeScript('return document.documentElement.clientWidth');
    const innerWidth: number = await this.driver.executeScript('return window.innerWidth');
    const viewWidth = innerWidth - (innerWidth - clientWidth);
    const clientHeight: number = await this.driver.executeScript('return document.documentElement.clientHeight');
    const innerHeight: number = await this.driver.executeScript('return window.innerHeight');
    const viewHeight: number = innerHeight - (innerHeight - clientHeight);
    let dynamicViewHeight: number = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');

    let isDeletedFixedPositions = false;
    for (let currentY = 0; currentY < dynamicViewHeight; currentY += viewHeight) {
      const screenshotHeight = currentY + viewHeight > dynamicViewHeight ? dynamicViewHeight % viewHeight : viewHeight;
      const screenshotConfig = {
        format: 'jpeg',
        quality: 90,
        captureBeyondViewport: false,
        fromSurface: true,
        clip: {
          width: viewWidth,
          height: screenshotHeight,
          x: 0,
          y: currentY,
          scale: 1,
        },
      };

      await this.driver.executeScript(`window.scrollTo(0, ${currentY})`);
      await wait(1000);

      const base64 = await cdp.send('Page.captureScreenshot', screenshotConfig);
      this.originalScreenShotsBase64.push(base64['result']['data']);

      dynamicViewHeight = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');

      if (!isDeletedFixedPositions) {
        await this.hideFixedElements();
        const newViewHeight: number = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');
        const fixedElementHeight = dynamicViewHeight - newViewHeight;

        currentY = currentY - fixedElementHeight;
        dynamicViewHeight = newViewHeight;
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
