import { DeviceSystemInfo, Serial, SerialPrintable } from '@dogu-private/types';
import { delay, loop } from '@dogu-tech/common';
import { boxBox } from 'intersects';
import { AppiumContextImpl, WDIOElement } from '../../../appium/appium.context';
import { CheckTimer } from '../../util/check-time';

export class IosResetService {
  private timer: CheckTimer;
  constructor(private serial: Serial, private logger: SerialPrintable) {
    this.timer = new CheckTimer(this.logger);
  }

  /*
   * Reset device and reboot
   */
  async reset(info: DeviceSystemInfo, appiumContext: AppiumContextImpl): Promise<void> {
    const { serial, logger } = this;
    logger.info(`IosResetService.reset begin`, { serial, info });

    await this.timer.check('IosResetService.reset.logoutApppleAccount', this.logoutApppleAccount(appiumContext));
    await this.timer.check('IosResetService.reset.clearSafariCache', this.clearSafariCache(appiumContext));
    await this.timer.check('IosResetService.reset.clearPhotoImages', this.clearPhotoImages(appiumContext));
    await this.timer.check('IosResetService.reset.clearPhotoAlbums', this.clearPhotoAlbums(appiumContext));
    await this.timer.check('IosResetService.reset.clearRecentlyDeletedPhotos', this.clearRecentlyDeletedPhotos(appiumContext));
    await this.timer.check('IosResetService.reset.clearPhotosSuggestionAndFeedbacks', this.clearPhotosSuggestionAndFeedbacks(appiumContext));

    this.logger.info(`IosResetService.reset end`, { serial, info });
  }

  private async logoutApppleAccount(appiumContext: AppiumContextImpl): Promise<void> {
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearSafariCache driver is null`);
    }
    await relaunchApp(driver, 'com.apple.Preferences');

    const account = await scrollToSelector(driver, new IosAccessibilitiySelector('APPLE_ACCOUNT'));
    await account.click();

    await delay(1000);

    let signout = await driver.$('~AAUIDeleteButtonSpecifierID');
    if (signout.error) {
      return;
    }

    signout = await scrollToSelector(driver, new IosAccessibilitiySelector('AAUIDeleteButtonSpecifierID'));
    await signout.click();
  }

  private async clearSafariCache(appiumContext: AppiumContextImpl): Promise<void> {
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearSafariCache driver is null`);
    }
    const ClearConfirmCount = 3;

    await relaunchApp(driver, 'com.apple.Preferences');

    const safari = await scrollToSelector(driver, new IosAccessibilitiySelector('Safari'));
    await safari.click();

    await scrollToSelector(driver, new IosAccessibilitiySelector('CLEAR_HISTORY_AND_DATA'));

    for (let i = 0; i < ClearConfirmCount; i++) {
      await clickSelector(driver, new IosAccessibilitiySelector('CLEAR_HISTORY_AND_DATA'));

      const clearConfirm = await driver.$(new IosAccessibilitiySelector('Clear History and Data').build());
      if (clearConfirm.error) {
        break;
      }
      if (!(await clearConfirm.waitForEnabled({ timeout: 1_000 }).catch(() => null))) {
        break;
      }
      await clearConfirm.click();

      await clickSelector(driver, new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Close Tabs"`]'));
    }
  }

  private async clearPhotoImages(appiumContext: AppiumContextImpl): Promise<void> {
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearPhotoImages driver is null`);
    }
    const { logger } = this;
    const WaitTimeout = 10_000;

    await relaunchApp(driver, 'com.apple.mobileslideshow');

    await clickSelector(driver, new IosAccessibilitiySelector('Library'));
    await clickSelector(driver, new IosAccessibilitiySelector('All Photos'));

    let loopCount = 0;
    let emptyCheckedCount = 0;
    for await (const _ of loop(300)) {
      logger.info(`IosResetService.clearPhotoImages loopCount: ${loopCount++}`);
      const imagesTry = await driver.$$(new IosClassChainSelector('**/XCUIElementTypeImage').build());
      if (imagesTry.length === 0) {
        emptyCheckedCount++;
        if (5 < emptyCheckedCount) {
          break;
        }
        await delay(1000);
        continue;
      }

      await clickSelector(driver, new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Select"`]'));

      const cancelButton = await driver.$(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Cancel"`]').build());
      const cancelRect = await cancelButton.getElementRect(cancelButton.elementId);

      const images = await driver.$$(new IosClassChainSelector('**/XCUIElementTypeImage').build());
      for (const image of images) {
        const rect = await image.getElementRect(image.elementId);

        if (boxBox(rect.x, rect.y, rect.width, rect.height, cancelRect.x, cancelRect.y, cancelRect.width, cancelRect.height)) {
          continue;
        }

        await image.click();
      }

      await clickSelector(driver, new IosAccessibilitiySelector('Delete'));
      await clickSelector(driver, new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete '`));
    }
  }

  private async clearPhotoAlbums(appiumContext: AppiumContextImpl): Promise<void> {
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearPhotoImages driver is null`);
    }

    await relaunchApp(driver, 'com.apple.mobileslideshow');
    await clickSelector(driver, new IosAccessibilitiySelector('Albums'));
    await clickSelector(driver, new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "See All"`]'));
    await clickSelector(driver, new IosAccessibilitiySelector('Edit'));

    let emptyCheckedCount = 0;
    for await (const _ of loop(300)) {
      const deleteDialogBtns = await driver.$$(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete,'`).build());
      if (deleteDialogBtns.length === 0) {
        emptyCheckedCount++;
        if (5 < emptyCheckedCount) {
          break;
        }
        await delay(1000);
        continue;
      }
      await deleteDialogBtns[0].click();

      await clickSelector(driver, new IosAccessibilitiySelector('Delete'));
    }
  }

  private async clearRecentlyDeletedPhotos(appiumContext: AppiumContextImpl): Promise<void> {
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearPhotoImages driver is null`);
    }
    const MaxScrollCount = 1000;
    const DeleteRepeatCount = 3;

    for await (const _ of loop(300, DeleteRepeatCount)) {
      await relaunchApp(driver, 'com.apple.mobileslideshow');

      for await (const _ of loop(300, MaxScrollCount)) {
        const recentlyDeleted = await driver.$(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Recently Deleted"`]').build());
        if (!(await recentlyDeleted.waitForEnabled({ timeout: 1_000 }).catch(() => null))) {
          await driver.execute('mobile: scroll', {
            direction: 'down',
          });
          continue;
        }
        await recentlyDeleted.click();
        break;
      }

      await clickSelector(driver, new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Select"`]'));
      await clickSelector(driver, new IosAccessibilitiySelector('Delete All'));
      await clickSelector(driver, new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete '`));
    }
  }

  private async clearPhotosSuggestionAndFeedbacks(appiumContext: AppiumContextImpl): Promise<void> {
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearPhotoImages driver is null`);
    }
    await relaunchApp(driver, 'com.apple.Preferences');

    const photos = await scrollToSelector(driver, new IosClassChainSelector('**/XCUIElementTypeCell[`label == "Photos"`]'));
    await photos.click();

    const resetMem = await scrollToSelector(driver, new IosAccessibilitiySelector('ResetBlacklistedMemoryFeatures'));
    await resetMem.click();
    await clickSelector(driver, new IosAccessibilitiySelector('Reset'));

    const resetFeedback = await scrollToSelector(driver, new IosAccessibilitiySelector('ResetPeopleFeedback'));
    await resetFeedback.click();
    await clickSelector(driver, new IosAccessibilitiySelector('Reset'));
  }
}

async function relaunchApp(driver: WebdriverIO.Browser, bundleId: string): Promise<void> {
  await driver.execute('mobile: terminateApp', {
    bundleId,
  });
  await driver.execute('mobile: launchApp', {
    bundleId,
  });
}

interface IosSelector {
  build(): string;
}

class IosAccessibilitiySelector {
  constructor(private id: string) {}

  build(): string {
    return `~${this.id}`;
  }
}

class IosClassChainSelector {
  constructor(private selector: string) {}

  build(): string {
    return `-ios class chain:${this.selector}`;
  }
}

class IosPredicateStringSelector {
  constructor(private selector: string) {}

  build(): string {
    return `-ios predicate string:${this.selector}`;
  }
}

async function clickSelector(driver: WebdriverIO.Browser, selector: IosSelector): Promise<void> {
  const WaitTimeout = 10_000;
  const elem = await driver.$(selector.build());
  await elem.waitForDisplayed({ timeout: WaitTimeout });
  await elem.click();
}

async function scrollToSelector(driver: WebdriverIO.Browser, selector: IosSelector): Promise<WDIOElement> {
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
