import { loop, loopTime, TimeOptions } from '@dogu-tech/common';
import WebDriverIO from 'webdriverio';
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

export class IosWebDriver {
  constructor(private driver: WebdriverIO.Browser) {}

  get rawDriver(): WebdriverIO.Browser {
    return this.driver;
  }

  async relaunchApp(bundleId: string): Promise<void> {
    const { driver } = this;
    await this.terminateApp(bundleId);
    await driver.execute('mobile: launchApp', {
      bundleId,
    });
  }

  async terminateApp(bundleId: string): Promise<void> {
    const { driver } = this;
    await driver.execute('mobile: terminateApp', {
      bundleId,
    });
  }

  async home(): Promise<void> {
    const { driver } = this;
    await driver.execute('mobile: pressButton', {
      name: 'home',
      duration: 0.3,
    });
  }

  async clickSelector(selector: IosSelector): Promise<void> {
    const { driver } = this;
    const WaitTimeout = 10_000;
    const elem = await driver.$(selector.build());
    await elem.waitForEnabled({ timeout: WaitTimeout });
    await elem.click();
  }

  async waitElementsExist(selector: IosSelector, timeOption: TimeOptions): Promise<WDIOElement[]> {
    const { driver } = this;
    for await (const _ of loopTime({ period: { milliseconds: 500 }, expire: timeOption })) {
      const elems = await driver.$$(selector.build());
      if (0 < elems.length) {
        return elems;
      }
    }
    return [];
  }

  async waitElementExist(selector: IosSelector, timeOption: TimeOptions): Promise<WDIOElement> {
    const { driver } = this;
    for await (const _ of loopTime({ period: { milliseconds: 500 }, expire: timeOption })) {
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
    await this.clickSelector(new IosAccessibilitiySelector('com.apple.springboardhome.application-shortcut-item.remove-widget'));
    await this.clickSelector(new IosAccessibilitiySelector('Remove'));
  }
}
