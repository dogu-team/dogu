import { FilledPrintable, loopTime, TimeOptions } from '@dogu-tech/common';
import { WDIOElement } from '../../../appium/appium.context';

const WaitElementsPeriod: TimeOptions = { milliseconds: 200 };

export class AndroidWebDriver {
  constructor(
    private driver: WebdriverIO.Browser,
    private logger: FilledPrintable,
  ) {}

  async waitElementExist(selector: string, timeOption: TimeOptions): Promise<WDIOElement> {
    const { driver } = this;
    for await (const _ of loopTime({ period: WaitElementsPeriod, expire: timeOption })) {
      const elem = await driver.$(selector);
      if (elem.error) {
        continue;
      }
      return elem;
    }
    throw new Error(`IosWebDriver.waitElementExist ${selector} failed`);
  }

  async waitElementsExist(selector: string, timeOption: TimeOptions): Promise<WDIOElement[]> {
    const { driver } = this;
    for await (const _ of loopTime({ period: WaitElementsPeriod, expire: timeOption })) {
      const elems = await driver.$$(selector);
      if (0 < elems.length) {
        return elems;
      }
    }
    return [];
  }
}
