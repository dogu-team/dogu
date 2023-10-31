import { DeviceSystemInfo, Serial, SerialPrintable } from '@dogu-private/types';
import { delay, loop, usingAsnyc } from '@dogu-tech/common';
import { boxBox } from 'intersects';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { IdeviceInstaller } from '../../externals/cli/ideviceinstaller';
import { IosAccessibilitiySelector, IosClassChainSelector, IosPredicateStringSelector, IosWebDriver } from '../../externals/webdriver/ios-webdriver';
import { CheckTimer } from '../../util/check-time';

export class IosResetService {
  private timer: CheckTimer;
  private _isResetting = false;
  constructor(
    private serial: Serial,
    private logger: SerialPrintable,
  ) {
    this.timer = new CheckTimer(this.logger);
  }

  get isResetting(): boolean {
    return this._isResetting;
  }

  /*
   * Reset device and reboot
   */
  async reset(info: DeviceSystemInfo, appiumContext: AppiumContextImpl): Promise<void> {
    const { serial, logger } = this;
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearSafariCache driver is null`);
    }
    const iosDriver = new IosWebDriver(driver);

    await usingAsnyc(
      {
        create: async () => {
          this._isResetting = true;
          this.logger.info(`IosResetService.reset begin`, { serial, info });
          await delay(0);
        },
        dispose: async () => {
          this._isResetting = false;
          this.logger.info(`IosResetService.reset end`, { serial, info });
          await delay(0);
        },
      },
      async () => {
        await this.timer.check('IosResetService.reset.removeUserApps', this.removeUserApps());
        await this.timer.check('IosResetService.reset.logoutApppleAccount', this.logoutApppleAccount(iosDriver));
        await this.timer.check('IosResetService.reset.clearSafariCache', this.clearSafariCache(iosDriver));
        await this.timer.check('IosResetService.reset.clearPhotoImages', this.clearPhotoImages(iosDriver));
        await this.timer.check('IosResetService.reset.clearPhotoAlbums', this.clearPhotoAlbums(iosDriver));
        await this.timer.check('IosResetService.reset.clearRecentlyDeletedPhotos', this.clearRecentlyDeletedPhotos(iosDriver));
        await this.timer.check('IosResetService.reset.clearPhotosSuggestionAndFeedbacks', this.clearPhotosSuggestionAndFeedbacks(iosDriver));
      },
    );
  }

  private async removeUserApps(): Promise<void> {
    const installer = new IdeviceInstaller(this.serial, this.logger);
    const userApps = await installer.getUserApps();
    for (const userApp of userApps) {
      await installer.uninstallApp(userApp.bundieId);
    }
  }

  private async logoutApppleAccount(iosDriver: IosWebDriver): Promise<void> {
    await iosDriver.relaunchApp('com.apple.Preferences');

    const account = await iosDriver.scrollToSelector(new IosAccessibilitiySelector('APPLE_ACCOUNT'));
    await account.click();

    await delay(1000);

    let signout = await iosDriver.rawDriver.$('~AAUIDeleteButtonSpecifierID');
    if (signout.error) {
      return;
    }

    signout = await iosDriver.scrollToSelector(new IosAccessibilitiySelector('AAUIDeleteButtonSpecifierID'));
    await signout.click();
  }

  private async clearSafariCache(iosDriver: IosWebDriver): Promise<void> {
    const ClearConfirmCount = 3;

    await iosDriver.relaunchApp('com.apple.Preferences');

    const safari = await iosDriver.scrollToSelector(new IosAccessibilitiySelector('Safari'));
    await safari.click();

    await iosDriver.scrollToSelector(new IosAccessibilitiySelector('CLEAR_HISTORY_AND_DATA'));

    for (let i = 0; i < ClearConfirmCount; i++) {
      await iosDriver.clickSelector(new IosAccessibilitiySelector('CLEAR_HISTORY_AND_DATA'));

      const clearConfirm = await $(new IosAccessibilitiySelector('Clear History and Data').build());
      if (clearConfirm.error) {
        break;
      }
      if (!(await clearConfirm.waitForEnabled({ timeout: 1_000 }).catch(() => null))) {
        break;
      }
      await clearConfirm.click();

      await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Close Tabs"`]'));
    }
  }

  private async clearPhotoImages(iosDriver: IosWebDriver): Promise<void> {
    const { logger } = this;
    const WaitTimeout = 10_000;

    await iosDriver.relaunchApp('com.apple.mobileslideshow');

    await iosDriver.clickSelector(new IosAccessibilitiySelector('Library'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('All Photos'));

    let loopCount = 0;
    let emptyCheckedCount = 0;
    for await (const _ of loop(300)) {
      logger.info(`IosResetService.clearPhotoImages loopCount: ${loopCount++}`);
      const imagesTry = await iosDriver.rawDriver.$$(new IosClassChainSelector('**/XCUIElementTypeImage').build());
      if (imagesTry.length === 0) {
        emptyCheckedCount++;
        if (5 < emptyCheckedCount) {
          break;
        }
        await delay(1000);
        continue;
      }

      await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Select"`]'));

      const cancelButton = await iosDriver.rawDriver.$(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Cancel"`]').build());
      const cancelRect = await cancelButton.getElementRect(cancelButton.elementId);

      const images = await iosDriver.rawDriver.$$(new IosClassChainSelector('**/XCUIElementTypeImage').build());
      for (const image of images) {
        const rect = await image.getElementRect(image.elementId);

        if (boxBox(rect.x, rect.y, rect.width, rect.height, cancelRect.x, cancelRect.y, cancelRect.width, cancelRect.height)) {
          continue;
        }

        await image.click();
      }

      await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete'));
      await iosDriver.clickSelector(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete '`));
    }
  }

  private async clearPhotoAlbums(iosDriver: IosWebDriver): Promise<void> {
    await iosDriver.relaunchApp('com.apple.mobileslideshow');
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Albums'));
    await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "See All"`]'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Edit'));

    let emptyCheckedCount = 0;
    for await (const _ of loop(300)) {
      const deleteDialogBtns = await iosDriver.rawDriver.$$(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete,'`).build());
      if (deleteDialogBtns.length === 0) {
        emptyCheckedCount++;
        if (5 < emptyCheckedCount) {
          break;
        }
        await delay(1000);
        continue;
      }
      await deleteDialogBtns[0].click();

      await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete'));
    }
  }

  private async clearRecentlyDeletedPhotos(iosDriver: IosWebDriver): Promise<void> {
    const MaxScrollCount = 1000;
    const DeleteRepeatCount = 3;

    for await (const _ of loop(300, DeleteRepeatCount)) {
      await iosDriver.relaunchApp('com.apple.mobileslideshow');

      for await (const _ of loop(300, MaxScrollCount)) {
        const recentlyDeleted = await iosDriver.rawDriver.$(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Recently Deleted"`]').build());
        if (!(await recentlyDeleted.waitForEnabled({ timeout: 1_000 }).catch(() => null))) {
          await driver.execute('mobile: scroll', {
            direction: 'down',
          });
          continue;
        }
        await recentlyDeleted.click();
        break;
      }

      await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Select"`]'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete All'));
      await iosDriver.clickSelector(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete '`));
    }
  }

  private async clearPhotosSuggestionAndFeedbacks(iosDriver: IosWebDriver): Promise<void> {
    await iosDriver.relaunchApp('com.apple.Preferences');

    const photos = await iosDriver.scrollToSelector(new IosClassChainSelector('**/XCUIElementTypeCell[`label == "Photos"`]'));
    await photos.click();

    const resetMem = await iosDriver.scrollToSelector(new IosAccessibilitiySelector('ResetBlacklistedMemoryFeatures'));
    await resetMem.click();
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset'));

    const resetFeedback = await iosDriver.scrollToSelector(new IosAccessibilitiySelector('ResetPeopleFeedback'));
    await resetFeedback.click();
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset'));
  }
}
