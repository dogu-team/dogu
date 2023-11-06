import { delay, FilledPrintable, loop, loopTime, PrefixLogger, retry, TimeOptions } from '@dogu-tech/common';
import WebDriverIO from 'webdriverio';
import { WebdriverAgentProcess } from '../cli/webdriver-agent-process';
export type WDIOElement = WebDriverIO.Element<'async'>;

export interface IosSelector {
  build(): string;
}

export class IosAccessibilitiySelector {
  constructor(private id: string) {}

  build(): string {
    return `~${this.id}`;
  }
}

export class IosClassChainSelector {
  constructor(private selector: string) {}

  build(): string {
    return `-ios class chain:${this.selector}`;
  }
}

export class IosPredicateStringSelector {
  constructor(private selector: string) {}

  build(): string {
    return `-ios predicate string:${this.selector}`;
  }
}

export class IosButtonPredicateStringSelector {
  constructor(private selector: string) {}

  build(): string {
    return new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && label == '${this.selector}'`).build();
  }
}

export class IosWebDriver {
  constructor(
    private driver: WebdriverIO.Browser,
    private wda: WebdriverAgentProcess,
    private logger: FilledPrintable,
  ) {}

  get rawDriver(): WebdriverIO.Browser {
    return this.driver;
  }

  async relaunchApp(bundleId: string): Promise<void> {
    await this.terminateApp(bundleId);
    await this.launchApp(bundleId);
  }

  async launchApp(bundleId: string): Promise<void> {
    const { wda, logger } = this;
    await retry(
      async () => {
        await wda.launchApp(bundleId);
        for await (const _ of loopTime({ period: { seconds: 1 }, expire: { seconds: 5 } })) {
          const apps = await wda.getActiveAppList();
          const some = apps.some((app) => app.bundleId === bundleId);
          if (some) {
            await delay(1000);
            return;
          }
        }
        throw new Error(`IosWebDriver.launchApp ${bundleId} failed. app not active`);
      },
      { retryCount: 6, retryInterval: 1000, printable: new PrefixLogger(logger, 'IosWebDriver.launchApp') },
    );
  }

  async terminateApp(bundleId: string): Promise<void> {
    const { wda, logger } = this;

    await retry(
      async () => {
        const apps = await wda.getActiveAppList();
        const some = apps.some((app) => app.bundleId === bundleId);
        if (!some) {
          return;
        }
        await wda.terminateApp(bundleId);
        for await (const _ of loopTime({ period: { seconds: 1 }, expire: { seconds: 5 } })) {
          const apps = await wda.getActiveAppList();
          const some = apps.some((app) => app.bundleId === bundleId);
          if (!some) {
            await delay(1000);
            return;
          }
        }
        throw new Error(`IosWebDriver.terminateApp ${bundleId} failed. app still active`);
      },
      { retryCount: 6, retryInterval: 1000, printable: new PrefixLogger(logger, 'IosWebDriver.terminateApp') },
    );
  }

  async home(): Promise<void> {
    const { wda } = this;
    await wda.goToHome();
    await delay(1000); // To prevent delay press home make launching app hide
  }

  async clickSelector(selector: IosSelector): Promise<void> {
    const { driver } = this;
    const WaitTimeout = 5_000;
    let lastError = '';
    for await (const _ of loopTime({ period: { milliseconds: 200 }, expire: { milliseconds: WaitTimeout } })) {
      const elem = await driver.$(selector.build());
      if (elem.error) {
        lastError = elem.error.message;
        continue;
      }
      await elem.click();
      await delay(500);
      return;
    }
    throw new Error(`IosWebDriver.clickSelector ${selector.build()} failed, error ${lastError}`);
  }

  async waitElementsExist(selector: IosSelector, timeOption: TimeOptions): Promise<WDIOElement[]> {
    const { driver } = this;
    for await (const _ of loopTime({ period: { milliseconds: 200 }, expire: timeOption })) {
      const elems = await driver.$$(selector.build());
      if (0 < elems.length) {
        return elems;
      }
    }
    return [];
  }

  async waitElementExist(selector: IosSelector, timeOption: TimeOptions): Promise<WDIOElement> {
    const { driver } = this;
    for await (const _ of loopTime({ period: { milliseconds: 200 }, expire: timeOption })) {
      const elem = await driver.$(selector.build());
      if (elem.error) {
        continue;
      }
      return elem;
    }
    throw new Error(`IosWebDriver.waitElementExist ${selector.build()} failed`);
  }

  static async waitElemElementsExist(elem: WDIOElement, selector: IosSelector, timeOption: TimeOptions): Promise<WDIOElement[]> {
    for await (const _ of loopTime({ period: { milliseconds: 500 }, expire: timeOption })) {
      const elems = await elem.$$(selector.build());
      if (0 < elems.length) {
        return elems;
      }
    }
    return [];
  }

  async scrollDownToSelector(selector: IosSelector): Promise<WDIOElement> {
    const { driver } = this;
    const MaxScrollCount = 30;

    for await (const _ of loop(300, MaxScrollCount)) {
      const elem = await driver.$(selector.build());
      if (elem.error) {
        await driver.execute('mobile: scroll', {
          direction: 'down',
          distance: 0.3,
        });
        continue;
      }
      return elem;
    }
    throw new Error(`scrollToAccessibility ${selector.build()} failed`);
  }

  async removeWidget(elem: WDIOElement): Promise<void> {
    await elem.touchAction([{ action: 'longPress' }, 'release']);
    await retry(
      async () => {
        // Remove Stack or Remove Widget
        const removeTopButtons = await this.waitElementsExist(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Remove '`), { seconds: 3 });
        if (0 < removeTopButtons.length) {
          await removeTopButtons[0].click();
          await this.clickSelector(new IosButtonPredicateStringSelector('Remove'));
          return;
        }
        await this.clickSelector(new IosAccessibilitiySelector('com.apple.springboardhome.application-shortcut-item.remove-widget'));
        await this.clickSelector(new IosButtonPredicateStringSelector('Remove'));
      },
      { retryCount: 3, retryInterval: 1000, printable: new PrefixLogger(this.logger, 'IosWebDriver.removeWidget') },
    );
  }

  async openNotificationCenter(): Promise<void> {
    await this.home();
    await this.home();
    const windowRect = await this.rawDriver.getWindowRect();
    await this.rawDriver.touchAction([
      {
        action: 'longPress',
        x: windowRect.width * 0.01,
        y: windowRect.height * 0.01,
      },
      {
        action: 'moveTo',
        x: windowRect.width * 0.01,
        y: windowRect.height * 0.9,
      },
      'release',
    ]);
    await this.waitElementExist(new IosAccessibilitiySelector('lockscreen-date-view'), { seconds: 3 });
  }
}
