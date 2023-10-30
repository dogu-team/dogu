import { DeviceSystemInfo, Serial, SerialPrintable } from '@dogu-private/types';
import { delay, loop } from '@dogu-tech/common';
import { boxBox } from 'intersects';
import { AppiumContextImpl } from '../../../appium/appium.context';

export class IosResetService {
  constructor(private serial: Serial, private logger: SerialPrintable) {}

  /*
   * Reset device and reboot
   */
  async reset(info: DeviceSystemInfo, appiumContext: AppiumContextImpl): Promise<void> {
    const { serial, logger } = this;
    logger.info(`IosResetService.reset begin`, { serial, info });

    await this.clearSafariCache(appiumContext);
    await this.clearPhotoImages(appiumContext);

    this.logger.info(`IosResetService.reset end`, { serial, info });
  }

  private async clearSafariCache(appiumContext: AppiumContextImpl): Promise<void> {
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearSafariCache driver is null`);
    }
    await driver.execute('mobile: terminateApp', {
      bundleId: 'com.apple.Preferences',
    });
    await driver.execute('mobile: launchApp', {
      bundleId: 'com.apple.Preferences',
    });
    for await (const _ of loop(300, 10)) {
      const safari = await driver.$('~Safari');
      if (!(await safari.waitForEnabled({ timeout: 1_000 }).catch(() => null))) {
        await driver.execute('mobile: scroll', {
          direction: 'down',
        });
        continue;
      }
      await safari.click();
      break;
    }

    for await (const _ of loop(300, 10)) {
      const clear = await driver.$('~CLEAR_HISTORY_AND_DATA');
      if (!(await clear.waitForEnabled({ timeout: 1_000 }).catch(() => null))) {
        await driver.execute('mobile: scroll', {
          direction: 'down',
        });
        continue;
      }
      break;
    }
    for (let i = 0; i < 3; i++) {
      const clear = await driver.$('~CLEAR_HISTORY_AND_DATA');
      await clear.click();

      const clearConfirm = await driver.$('~Clear History and Data').catch(() => null);
      if (!clearConfirm) {
        break;
      }
      if (!(await clearConfirm.waitForEnabled({ timeout: 1_000 }).catch(() => null))) {
        break;
      }
      await clearConfirm.click();

      const closeTabSelector = '**/XCUIElementTypeButton[`label == "Close Tabs"`]';
      const clearTabs = await driver.$(`-ios class chain:${closeTabSelector}`);
      await clearTabs.waitForEnabled({ timeout: 1_000 });
      await clearTabs.click();
    }
  }

  private async clearPhotoImages(appiumContext: AppiumContextImpl): Promise<void> {
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearSafariCache driver is null`);
    }
    const WaitTimeout = 10_000;

    await driver.execute('mobile: terminateApp', {
      bundleId: 'com.apple.mobileslideshow',
    });
    await driver.execute('mobile: launchApp', {
      bundleId: 'com.apple.mobileslideshow',
    });
    const library = await driver.$('~Library');
    await library.waitForDisplayed({ timeout: WaitTimeout });
    await library.click();

    const allPhotos = await driver.$('~All Photos');
    await allPhotos.waitForDisplayed({ timeout: WaitTimeout });
    await allPhotos.click();

    let emptyCheckedCount = 0;

    for (let i = 0; i < 10; i++) {
      const imagesSelector = '**/XCUIElementTypeImage';
      const imagesTry = await driver.$$(`-ios class chain:${imagesSelector}`);
      if (imagesTry.length === 0) {
        emptyCheckedCount++;
        if (5 < emptyCheckedCount) {
          break;
        }
        await delay(1000);
        continue;
      }

      const selectButtonSelector = '**/XCUIElementTypeButton[`label == "Select"`]';
      const selectButton = await driver.$(`-ios class chain:${selectButtonSelector}`);
      await selectButton.waitForEnabled({ timeout: WaitTimeout });
      await selectButton.click();

      const cancelButtonSelector = '**/XCUIElementTypeButton[`label == "Cancel"`]';
      const cancelButton = await driver.$(`-ios class chain:${cancelButtonSelector}`);
      const cancelRect = await cancelButton.getElementRect(cancelButton.elementId);

      const images = await driver.$$(`-ios class chain:${imagesSelector}`);
      for (const image of images) {
        const rect = await image.getElementRect(image.elementId);

        if (boxBox(rect.x, rect.y, rect.width, rect.height, cancelRect.x, cancelRect.y, cancelRect.width, cancelRect.height)) {
          continue;
        }

        await image.click().catch(() => {});
      }

      const deleteButton = await driver.$('~Delete');
      await deleteButton.waitForEnabled({ timeout: WaitTimeout });
      await deleteButton.click();

      const deleteSelector = `type == 'XCUIElementTypeButton' && name CONTAINS 'Delete '`;
      const deleteDialogBtn = await driver.$(`-ios predicate string:${deleteSelector}`);
      await deleteDialogBtn.waitForEnabled({ timeout: WaitTimeout });
      await deleteDialogBtn.click();
    }
  }
}
