import { loop } from '@dogu-tech/common';
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
    await driver.execute('mobile: terminateApp', {
      bundleId,
    });
    await driver.execute('mobile: launchApp', {
      bundleId,
    });
  }

  async clickSelector(selector: IosSelector): Promise<void> {
    const { driver } = this;
    const WaitTimeout = 10_000;
    const elem = await driver.$(selector.build());
    await elem.waitForDisplayed({ timeout: WaitTimeout });
    await elem.click();
  }

  async scrollToSelector(selector: IosSelector): Promise<WDIOElement> {
    const { driver } = this;
    const MaxScrollCount = 1000;

    for await (const _ of loop(300, MaxScrollCount)) {
      const elem = await driver.$(selector.build());
      if (!(await elem.waitForEnabled({ timeout: 1_000 }).catch(() => null))) {
        await driver.execute('mobile: scroll', {
          direction: 'down',
        });
        continue;
      }
      return elem;
    }
    throw new Error(`scrollToAccessibility ${selector.build()} failed`);
  }
}
