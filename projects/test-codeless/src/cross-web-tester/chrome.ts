import * as cheerio from 'cheerio';
import { Browser, Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { promisify } from 'util';

import { BrowserDriver } from './browser';

const wait = promisify(setTimeout);

export class Chrome extends BrowserDriver {
  constructor(driverName: string) {
    super(driverName);
  }

  async build(): Promise<void> {
    const options = new chrome.Options();
    // options.addArguments("--headless");
    options.excludeSwitches('enable-automation');
    options.addArguments('--enable-gpu');
    options.addArguments('--window-size=1920,1080');

    this.driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();

    await this.driver.manage().window().maximize();
  }

  async takeScreenshot(): Promise<void> {
    const cdp = await this.driver.createCDPConnection('page');
    const maxWidth: number = await this.driver.executeScript('return document.documentElement.scrollWidth');
    let maxHeight: number = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');
    const viewHeight: number = await this.driver.executeScript('return document.documentElement.clientHeight;');

    let isDeletedFixedPositions = false;

    for (let currentY = 0; currentY < maxHeight; currentY += viewHeight) {
      const screenshotHeight = currentY + viewHeight > maxHeight ? maxHeight % viewHeight : viewHeight;

      const screenshotConfig = {
        format: 'jpeg',
        quality: 90,
        captureBeyondViewport: false,
        fromSurface: true,
        clip: {
          width: maxWidth,
          height: screenshotHeight,
          x: 0,
          y: currentY,
          scale: 1,
        },
      };

      await this.driver.executeScript(`window.scrollTo(0, ${currentY})`);

      await wait(1000);

      const base64 = await cdp.send('Page.captureScreenshot', screenshotConfig);
      this.originalScreeShotsBase64.push(base64['result']['data']);

      const pageSource = await this.driver.getPageSource();
      const $ = cheerio.load(pageSource);
      const body = $('body')[0];

      await this.hideText(body, 0);
      await wait(1000);
      const hiddenTextBase64 = await cdp.send('Page.captureScreenshot', screenshotConfig);

      this.hiddenTextScreenshotsBase64.push(hiddenTextBase64['result']['data']);

      await this.hideText(body, 1);

      maxHeight = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');

      if (!isDeletedFixedPositions) {
        await this.hideFixedElements();
        const newMaxHeight: number = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');
        const fixedElementHeight = maxHeight - newMaxHeight;

        currentY = currentY - fixedElementHeight;
        maxHeight = newMaxHeight;
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
