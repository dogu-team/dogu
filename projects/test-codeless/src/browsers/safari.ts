import * as cheerio from 'cheerio';
import { Browser, Builder } from 'selenium-webdriver';
import safari from 'selenium-webdriver/safari';
import { promisify } from 'util';

import { ImageTool } from '../image-tools/imageTool';
import { BrowserDriver } from './browser';

const wait = promisify(setTimeout);

export class Safari extends BrowserDriver {
  constructor(driverName: string, width: number, height: number, pixelRatio: number) {
    super(driverName, width, height, pixelRatio);
  }

  async build(): Promise<void> {
    const options = new safari.Options();
    this.driver = await new Builder().forBrowser(Browser.SAFARI).setSafariOptions(options).build();

    await this.driver.manage().window().setRect({
      width: this.widthResolution,
      height: this.heightResolution,
    });
    await this.driver.manage().window().maximize();
  }

  async takeScreenshot(): Promise<void> {
    const maxWidth: number = await this.driver.executeScript('return document.documentElement.scrollWidth');
    let maxHeight: number = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');
    const viewHeight: number = await this.driver.executeScript('return document.documentElement.clientHeight;');

    let isDeletedFixedPositions = false;

    for (let currentY = 0; currentY < maxHeight; currentY += viewHeight) {
      const isLast = currentY + viewHeight > maxHeight;
      const lastHeight = maxHeight % viewHeight;

      await this.driver.executeScript(`window.scrollTo(0, ${currentY})`);
      await wait(1000);

      const screenshot = await this.driver.takeScreenshot();
      if (isLast) {
        const croppedScreenshot = await ImageTool.cropImage(screenshot, lastHeight * 2);
        this.originalScreeShotsBase64.push(croppedScreenshot);
      } else {
        this.originalScreeShotsBase64.push(screenshot);
      }

      const pageSource = await this.driver.getPageSource();
      const $ = cheerio.load(pageSource);
      const body = $('body')[0];

      await this.hideText(body, 0);
      await wait(1000);
      const hiddenTextScreenshot = await this.driver.takeScreenshot();
      await this.hideText(body, 1);

      if (isLast) {
        const croppedScreenshot = await ImageTool.cropImage(hiddenTextScreenshot, lastHeight * 2);
        this.hiddenTextScreenshotsBase64.push(croppedScreenshot);
      } else {
        this.hiddenTextScreenshotsBase64.push(hiddenTextScreenshot);
      }

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
