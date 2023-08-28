import { loop } from '@dogu-tech/common';
import { Browser, chromium, ElementHandle, Locator as _Locator, Page } from '@playwright/test';
import lodash from 'lodash';
import { L10n } from './l10n';
import { Timer } from './timer';

interface Locator {
  xpath: string;
}
interface LogEntry {
  level: string;
  message: string;
}

export interface FindElementOptions {
  /**
   * @default 30_000
   */
  waitTime?: number;

  /**
   * @default false
   */
  focusWindow?: boolean;
}

export interface ClickElementOptions {
  force: boolean;
}

function defaultFindElementOptions(): Required<FindElementOptions> {
  return {
    waitTime: 30 * 1000,
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

export class PlaywrightDriver {
  private browser!: Browser;
  public page!: Page;
  private logEntries: LogEntry[] = [];

  async open(options?: DriverOptions): Promise<void> {
    const { l10n } = fillDriverOptions(options);
    this.browser = await chromium.launch({ headless: false });
    const context = await this.browser.newContext({ locale: l10n });

    this.page = await context.newPage();
    this.page.on('console', (msg) => {
      this.logEntries.push({ level: msg.type(), message: msg.text() });
    });
  }

  async close(): Promise<void> {
    await this.page?.close();
  }

  async closeBrowser(): Promise<void> {
    await this.browser?.close();
  }

  logs(): Promise<LogEntry[]> {
    return Promise.resolve(this.logEntries);
  }

  async focusWindow(): Promise<void> {}

  async moveTo(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.waitForLoadState();
  }

  async findElement(locator: Locator, options?: FindElementOptions): Promise<ElementHandle<SVGElement | HTMLElement>> {
    const { waitTime, focusWindow } = fillFindElementOptions(options);
    if (focusWindow) {
      await this.focusWindow();
    }
    const elem = await this.page.waitForSelector(`xpath=${locator.xpath}`, { timeout: waitTime });
    return elem;
  }
  async waitTextElement(text: string, options?: FindElementOptions): Promise<void> {
    const { waitTime, focusWindow } = fillFindElementOptions(options);
    if (focusWindow) {
      await this.focusWindow();
    }
    await this.page.getByText(text, { exact: true }).first().waitFor({ timeout: waitTime, state: 'visible' });
  }

  async findElements(locator: Locator, options?: FindElementOptions): Promise<(SVGElement | HTMLElement)[]> {
    const filledOptions = fillFindElementOptions(options);
    const { waitTime, focusWindow } = filledOptions;
    if (focusWindow) {
      await this.focusWindow();
    }

    const elem = await this.page.waitForSelector(`xpath=${locator.xpath}`, { timeout: waitTime });
    const elems = await this.page.$$eval(`xpath=${locator.xpath}`, (e) => e);
    return elems;
  }

  async clickElement(locator: Locator, options?: FindElementOptions, clickOptions?: ClickElementOptions): Promise<void> {
    await this.page.click(`xpath=${locator.xpath}`, { timeout: options?.waitTime ?? 60_000, ...clickOptions });
    await Timer.wait(100, 'clickElement');
  }
  async clickElementLazy(locator: Locator, options?: FindElementOptions, clickOptions?: ClickElementOptions): Promise<void> {
    const elem = this.page.locator(`xpath=${locator.xpath}`);
    await elem.focus();
    await Timer.wait(3000, 'clickElementLazy');
    await elem.click({ timeout: options?.waitTime ?? 60_000, ...clickOptions });
    await Timer.wait(100, 'clickElement');
  }

  async focusElement(locator: Locator, options?: FindElementOptions, clickOptions?: ClickElementOptions): Promise<void> {
    const elem = this.page.locator(`xpath=${locator.xpath}`);
    await elem.focus();
    await Timer.wait(2000, 'wait for focus');
  }

  async sendKeys(locator: Locator, keys: string, options?: FindElementOptions): Promise<void> {
    const elem = await this.findElement(locator, options);
    await elem.focus();
    // const prevInput = await elem.inputValue();
    for (let key of keys) {
      if (key === '\b') {
        key = 'Backspace';
      }
      await this.page.keyboard.press(key);
    }

    // await this.page.fill(`xpath=${locator.xpath}`, `${prevInput}${keys}`);
  }

  async getText(locator: Locator, options?: FindElementOptions): Promise<string> {
    const element = await this.findElement(locator, options);
    const text = (await element.textContent()) ?? (await element.inputValue()) ?? (await element.innerText()).valueOf() ?? '';
    return text;
  }

  locator(locator: Locator): _Locator {
    return this.page.locator(`xpath=${locator.xpath}`);
  }

  async uploadFile(locator: Locator, filePath: string, options?: FindElementOptions): Promise<void> {
    const elementRaw = this.page.locator(`xpath=${locator.xpath}`);
    await elementRaw.evaluate((e) => {
      e.style.display = 'block';
    });
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.clickElement(locator, options);
    // await this.page.getByText('Choose File').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  getWindowSize(): Promise<{ width: number; height: number }> {
    const size = this.page.viewportSize() ?? { width: 0, height: 0 };
    return Promise.resolve({ width: size.width, height: size.height });
  }

  async switchTab(tabIndex: number): Promise<void> {
    const context = this.page.context();
    for await (const _ of loop(3000, 10)) {
      const pages = context.pages();
      if (tabIndex < pages.length) {
        break;
      }
    }
    if (tabIndex >= context.pages().length) {
      throw new Error(`Tab index ${tabIndex} is out of range`);
    }
    const pages = context.pages();
    const targetPage = pages[tabIndex];
    await targetPage.bringToFront();
    this.page = targetPage;
    this.page.on('console', (msg) => {
      this.logEntries.push({ level: msg.type(), message: msg.text() });
    });
    await this.page.waitForLoadState();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }
}

const driver = new PlaywrightDriver();
export { driver as Driver };
