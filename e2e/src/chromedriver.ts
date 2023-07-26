import { Retry, stringify } from '@dogu-tech/common';
import lodash from 'lodash';
import webdriver, { Actions, Locator, ThenableWebDriver, until, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { L10n } from './l10n';
import { pathMap } from './path-map';
import { Timer } from './timer';

export interface FindElementOptions {
  /**
   * @default 5000
   */
  waitTime?: number;

  /**
   * @default false
   */
  focusWindow?: boolean;
}

function defaultFindElementOptions(): Required<FindElementOptions> {
  return {
    waitTime: 5 * 1000,
    focusWindow: false,
  };
}

function fillFindElementOptions(options?: FindElementOptions): Required<FindElementOptions> {
  return lodash.merge(defaultFindElementOptions(), options);
}

export interface DriverOptions {
  /**
   * @default 'en'
   */
  l10n?: L10n;
}

function defaultDriverOptions(): Required<DriverOptions> {
  return {
    l10n: 'en',
  };
}

function fillDriverOptions(options?: DriverOptions): Required<DriverOptions> {
  const merged = lodash.merge(defaultDriverOptions(), options);
  if (!L10n.includes(merged.l10n)) {
    throw new Error(`Unknown l10n: ${merged.l10n}`);
  }
  return merged;
}

export class ChromeDriver {
  private driver!: ThenableWebDriver;

  open(options?: DriverOptions): void {
    const { l10n } = fillDriverOptions(options);

    const chromeService = new chrome.ServiceBuilder(pathMap.chromeDriver).build();
    chrome.setDefaultService(chromeService);

    const prefs = new webdriver.logging.Preferences();
    prefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);

    const chromeOptions = new chrome.Options();
    chromeOptions.setUserPreferences({ 'intl.accept_languages': l10n });
    chromeOptions.setLoggingPrefs(prefs);
    this.driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
  }

  async close(): Promise<void> {
    if (this.driver !== undefined) {
      await this.driver.close();
    }
  }

  async logs(): Promise<webdriver.logging.Entry[]> {
    const logs = await this.driver.manage().logs().get(webdriver.logging.Type.BROWSER);
    return logs;
  }

  async focusWindow(): Promise<void> {
    await this.driver.executeScript('alert("Focus window")');
    await this.driver.switchTo().alert().accept();
  }

  @Retry({ retryCount: 10, retryInterval: 3000 })
  async moveTo(url: string): Promise<void> {
    await this.driver.get(url);

    const documentState = await this.driver.executeScript<string>('return document.readyState');
    if (documentState !== 'complete') {
      throw new Error(`Document state is not complete: ${documentState}`);
    }
  }

  @Retry({ retryCount: 10, retryInterval: 3000 })
  async findElement(locator: Locator, options?: FindElementOptions): Promise<WebElement> {
    const { waitTime, focusWindow } = fillFindElementOptions(options);
    if (focusWindow) {
      await this.focusWindow();
    }

    await this.driver.wait(until.elementLocated(locator), waitTime);
    const element = this.driver.findElement(locator);

    await Promise.all([this.driver.wait(until.elementIsVisible(element), waitTime), this.driver.wait(until.elementIsEnabled(element), waitTime)]);

    return element;
  }

  @Retry({ retryCount: 10, retryInterval: 3000 })
  async findElements(locator: Locator, options?: FindElementOptions): Promise<WebElement[]> {
    const filledOptions = fillFindElementOptions(options);
    const { waitTime, focusWindow } = filledOptions;
    if (focusWindow) {
      await this.focusWindow();
    }

    await this.driver.wait(until.elementLocated(locator), waitTime);
    const elements = await this.driver.findElements(locator);

    const waits: webdriver.WebElementPromise[] = [];
    for (const element of elements) {
      waits.push(this.driver.wait(until.elementIsVisible(element), waitTime));
      waits.push(this.driver.wait(until.elementIsEnabled(element), waitTime));
    }
    await Promise.all(waits);

    return elements;
  }

  async clickElement(locator: Locator, options?: FindElementOptions): Promise<void> {
    const element = await this.findElement(locator, options);
    const tryCount = 10;
    for (let i = 0; i < tryCount; i++) {
      try {
        console.log(`Click element: ${stringify(locator)}, try: ${i + 1}/${tryCount}`);
        await element.click();
        return;
      } catch (error) {
        await Timer.wait(1000, `Click element failed: ${(error as Error).toString()}`);
        if (i >= tryCount - 1) {
          throw error;
        }
      }
    }
  }

  async sendKeys(locator: Locator, keys: string, options?: FindElementOptions): Promise<void> {
    const element = await this.findElement(locator, options);
    await element.sendKeys(keys);
  }

  async getText(locator: Locator, options?: FindElementOptions): Promise<string> {
    const element = await this.findElement(locator, options);
    const text = await element.getText();
    return text;
  }

  async uploadFile(locator: Locator, filePath: string, options?: FindElementOptions): Promise<void> {
    const elementRaw = await this.driver.findElement(locator);
    await this.driver.executeScript('arguments[0].style.display = "block";', elementRaw);
    const element = await this.findElement(locator, options);
    await element.sendKeys(filePath);
  }

  async getWindowSize(): Promise<{ width: number; height: number }> {
    const size = await this.driver.manage().window().getRect();
    return size;
  }

  async clickCoordinates(x: number, y: number): Promise<void> {
    await this.driver.actions().move({ x, y }).click().perform();
  }

  async sendKeysToActiveElement(keys: string): Promise<void> {
    await this.driver.actions().sendKeys(keys).perform();
  }

  async sendKeysWithPressedKey(key: string, keys: string): Promise<void> {
    await this.driver.actions().keyDown(key).sendKeys(keys).keyUp(key).perform();
  }

  async getPageSource(): Promise<string> {
    return await this.driver.getPageSource();
  }

  async scrollToBottom(): Promise<void> {
    return await this.driver.actions().sendKeys(webdriver.Key.END).perform();
  }

  actions(): Actions {
    return this.driver.actions();
  }

  navigate(): webdriver.Navigation {
    return this.driver.navigate();
  }
}

const driver = new ChromeDriver();
export { driver as Driver };
