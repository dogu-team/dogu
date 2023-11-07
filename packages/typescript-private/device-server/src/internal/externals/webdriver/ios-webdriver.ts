import { delay, FilledPrintable, loop, loopTime, PrefixLogger, retry, time, TimeOptions, usingAsnyc } from '@dogu-tech/common';
import semver from 'semver';
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

const AppSwitchLoopPeriod: TimeOptions = { milliseconds: 200 };
const WaitElementsPeriod: TimeOptions = { milliseconds: 200 };

export class IosWebDriverInfo {
  constructor(
    public isIpad: boolean,
    private osVersion: semver.SemVer,
  ) {}

  get isIpadAndSystemAppHasSidebar(): boolean {
    if (!this.isIpad) {
      return false;
    }
    if (semver.lt(this.osVersion, '14.0.0')) {
      return false;
    }
    return true;
  }
}

export class IosWebDriver {
  constructor(
    private driver: WebdriverIO.Browser,
    private wda: WebdriverAgentProcess,
    private info: IosWebDriverInfo,
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
        for await (const _ of loopTime({ period: AppSwitchLoopPeriod, expire: { seconds: 5 } })) {
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
        for await (const _ of loopTime({ period: AppSwitchLoopPeriod, expire: { seconds: 5 } })) {
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

  async homeAndDismissAlert(): Promise<void> {
    const { wda } = this;
    await wda.dismissAlert();
    await wda.goToHome();
    await delay(1000); // To prevent delay press home make launching app hide
  }

  async clickSelector(selector: IosSelector): Promise<void> {
    const { driver } = this;
    const WaitTimeout = 5_000;
    let lastError = '';
    for await (const _ of loopTime({ period: WaitElementsPeriod, expire: { milliseconds: WaitTimeout } })) {
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

  async clickSelectors(selectors: IosSelector[]): Promise<void> {
    for (const selector of selectors) {
      try {
        await this.clickSelector(selector);
        return;
      } catch (e) {}
    }

    throw new Error(`IosWebDriver.tryClickSelectors ${selectors.map((s) => s.build()).join(', ')} all failed`);
  }

  async waitElementsExist(selector: IosSelector, timeOption: TimeOptions): Promise<WDIOElement[]> {
    const { driver } = this;
    for await (const _ of loopTime({ period: WaitElementsPeriod, expire: timeOption })) {
      const elems = await driver.$$(selector.build());
      if (0 < elems.length) {
        return elems;
      }
    }
    return [];
  }

  async waitElementExist(selector: IosSelector, timeOption: TimeOptions): Promise<WDIOElement> {
    const { driver } = this;
    for await (const _ of loopTime({ period: WaitElementsPeriod, expire: timeOption })) {
      const elem = await driver.$(selector.build());
      if (elem.error) {
        continue;
      }
      return elem;
    }
    throw new Error(`IosWebDriver.waitElementExist ${selector.build()} failed`);
  }

  static async waitElemElementsExist(elem: WDIOElement, selector: IosSelector, timeOption: TimeOptions): Promise<WDIOElement[]> {
    for await (const _ of loopTime({ period: WaitElementsPeriod, expire: timeOption })) {
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

    for await (const _ of loop(time(WaitElementsPeriod), MaxScrollCount)) {
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
    await this.homeAndDismissAlert();
    await this.homeAndDismissAlert();
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

  async openSystemAppToggleMenu(value: string): Promise<void> {
    const { info } = this;

    await usingAsnyc(
      {
        create: async () => {
          if (!info.isIpadAndSystemAppHasSidebar) {
            return;
          }
          throw new Error(`Should unfold each menus`);
          const elems = await this.waitElementsExist(new IosButtonPredicateStringSelector(value), { seconds: 3 });
          if (0 === elems.length) {
            await this.clickSelector(new IosButtonPredicateStringSelector('Show Sidebar'));
          }
        },
        dispose: async () => {
          if (!info.isIpadAndSystemAppHasSidebar) {
            return;
          }
          await this.clickSelector(new IosButtonPredicateStringSelector('Hide Sidebar'));
        },
      },
      async () => {
        await this.clickSelector(new IosButtonPredicateStringSelector(value));
      },
    );
  }
}
