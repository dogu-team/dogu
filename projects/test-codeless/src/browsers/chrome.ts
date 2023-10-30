import path from 'path';
import { Browser, Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { promisify } from 'util';
import { Device } from '../device/devices';

import { BrowserDriver } from './browser';

const wait = promisify(setTimeout);

export class Chrome extends BrowserDriver {
  static customChromeDriverPath = path.join(__dirname, '../binary/chromedriver');

  constructor(device: Device, viewportWidth: number, viewportHeight: number, pixelRatio: number) {
    super(device, viewportWidth, viewportHeight, pixelRatio);
  }

  async build(): Promise<void> {
    // const services = new chrome.ServiceBuilder(Chrome.customChromeDriverPath);
    const options = new chrome.Options();

    // options.addArguments('--headless');
    options.addArguments('--enable-gpu');
    options.addArguments(`--window-size=${this.viewportWidth},${this.viewportHeight}`);
    options.addArguments(`--user-agent=${this.createUserAgent()}`);
    options.excludeSwitches('enable-automation');
    options.setLoggingPrefs({ browser: 'ALL', performance: 'ALL' });

    this.driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
  }

  async takeScreenshot(): Promise<void> {
    const cdp = await this.driver.createCDPConnection('page');
    const maxWidth: number = await this.driver.executeScript('return document.documentElement.scrollWidth');
    let maxHeight: number = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');
    const viewHeight: number = await this.driver.executeScript('return document.documentElement.clientHeight;');

    // await this.driver.executeScript(`
    // function disableCSSAnimationsAndTransitions() {
    //     const style = document.createElement('style');
    //     style.innerHTML = \`
    //     *,
    //     *::before,
    //     *::after {
    //         animation-name: none !important;
    //         animation-duration: 0s !important;
    //         animation-delay: 0s !important;
    //         animation-timing-function: step-start !important;
    //         animation-iteration-count: 1 !important;
    //         animation-direction: normal !important;
    //         animation-fill-mode: both !important;
    //         animation-play-state: paused !important;

    //         transition-property: none !important;
    //         transition-duration: 0s !important;
    //         transition-timing-function: step-start !important;
    //         transition-delay: 0s !important;

    //         transform: none !important;
    //     }
    //     \`;

    //     document.head.appendChild(style);
    //   }

    //   disableCSSAnimationsAndTransitions();
    //   document.body.style.overflowX = 'hidden';
    // `);

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

      // const pageSource = await this.driver.getPageSource();
      // const $ = cheerio.load(pageSource);
      // const body = $('body')[0];

      // await this.hideText(body, 0);
      // await wait(1000);
      // const hiddenTextBase64 = await cdp.send('Page.captureScreenshot', screenshotConfig);

      // this.hiddenTextScreenshotsBase64.push(hiddenTextBase64['result']['data']);

      // await this.hideText(body, 1);

      maxHeight = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');

      if (!isDeletedFixedPositions) {
        await this.hideFixedElements();
        const newMaxHeight: number = await this.driver.executeScript('return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );');
        const fixedElementHeight = maxHeight - newMaxHeight;

        currentY = currentY - fixedElementHeight;
        maxHeight = newMaxHeight;
        isDeletedFixedPositions = true;
      }

      // let browserLogs = await this.driver.manage().logs().get(logging.Type.BROWSER);
      // let performanceLogs = await this.driver.manage().logs().get(logging.Type.PERFORMANCE);
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
