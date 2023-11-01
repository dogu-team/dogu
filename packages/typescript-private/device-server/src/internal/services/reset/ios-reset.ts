import { Serial, SerialPrintable } from '@dogu-private/types';
import { delay, filterAsync, loop, loopTime, usingAsnyc } from '@dogu-tech/common';
import { boxBox } from 'intersects';
import { AppiumContextImpl, WDIOElement } from '../../../appium/appium.context';
import { IdeviceInstaller } from '../../externals/cli/ideviceinstaller';
import { IosAccessibilitiySelector, IosClassChainSelector, IosPredicateStringSelector, IosWebDriver } from '../../externals/webdriver/ios-webdriver';
import { CheckTimer } from '../../util/check-time';

export interface IosResetInfo {
  lastResetTime: number;
}

const ResetExpireTime = 10 * 60 * 1000;

export class IosResetService {
  private timer: CheckTimer;
  private _isResetting = false;
  private static map: Map<Serial, IosResetInfo> = new Map(); // Hold for process lifetime
  constructor(
    private serial: Serial,
    private logger: SerialPrintable,
  ) {
    this.timer = new CheckTimer(this.logger);
  }

  get isResetting(): boolean {
    return this._isResetting;
  }

  async makeDirty(): Promise<void> {
    IosResetService.map.delete(this.serial);
    await Promise.resolve();
  }

  async isDirty(): Promise<boolean> {
    const { serial } = this;
    const lastResetInfo = IosResetService.map.get(serial);
    if (!lastResetInfo) {
      return true;
    }
    const { lastResetTime } = lastResetInfo;
    if (Date.now() - lastResetTime > ResetExpireTime) {
      return true;
    }
    return false;
    await Promise.resolve();
  }

  /*
   * Reset device and reboot
   */
  async reset(appiumContext: AppiumContextImpl): Promise<void> {
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
          this.logger.info(`IosResetService.reset begin`, { serial });
          await delay(0);
        },
        dispose: async () => {
          this._isResetting = false;
          this.logger.info(`IosResetService.reset end`, { serial });
          await delay(0);
        },
      },
      async () => {
        await this.timer.check('IosResetService.reset.logoutApppleAccount', this.logoutApppleAccount(iosDriver));
        await this.timer.check('IosResetService.reset.clearSafariCache', this.clearSafariCache(iosDriver));
        await this.timer.check('IosResetService.reset.clearPhotoImages', this.clearPhotoImages(iosDriver));
        await this.timer.check('IosResetService.reset.clearPhotoAlbums', this.clearPhotoAlbums(iosDriver));
        await this.timer.check('IosResetService.reset.clearPhotosRecentlyDeleted', this.clearPhotosRecentlyDeleted(iosDriver));
        await this.timer.check('IosResetService.reset.clearPhotosSuggestionAndFeedbacks', this.clearPhotosSuggestionAndFeedbacks(iosDriver));
        await this.timer.check('IosResetService.reset.clearFilesOnMyiPhone', this.clearFilesOnMyiPhone(iosDriver));
        await this.timer.check('IosResetService.reset.clearFilesRecentlyDeleted', this.clearFilesRecentlyDeleted(iosDriver));
        await this.timer.check('IosResetService.reset.resetSettings', this.resetSettings(iosDriver));
        await this.timer.check('IosResetService.reset.removeWidgets', this.removeWidgets(iosDriver));
        await this.timer.check('IosResetService.reset.removeUserApps', this.removeUserApps()); // last step because this removes appium
        IosResetService.map.set(serial, { lastResetTime: Date.now() });
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

    const account = await iosDriver.scrollDownToSelector(new IosAccessibilitiySelector('APPLE_ACCOUNT'));
    await account.click();

    await delay(1000);

    let signout = await iosDriver.rawDriver.$('~AAUIDeleteButtonSpecifierID');
    if (signout.error) {
      return;
    }

    signout = await iosDriver.scrollDownToSelector(new IosAccessibilitiySelector('AAUIDeleteButtonSpecifierID'));
    await signout.click();
  }

  private async clearSafariCache(iosDriver: IosWebDriver): Promise<void> {
    const DeleteRepeatCount = 1;

    for (let i = 0; i < DeleteRepeatCount; i++) {
      await iosDriver.relaunchApp('com.apple.Preferences');

      const safari = await iosDriver.scrollDownToSelector(new IosAccessibilitiySelector('Safari'));
      await safari.click();

      await iosDriver.scrollDownToSelector(new IosAccessibilitiySelector('CLEAR_HISTORY_AND_DATA'));

      await iosDriver.clickSelector(new IosAccessibilitiySelector('CLEAR_HISTORY_AND_DATA'));

      await iosDriver.clickSelector(new IosAccessibilitiySelector('Clear History and Data'));

      await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Close Tabs"`]'));
    }
  }

  private async clearPhotoImages(iosDriver: IosWebDriver): Promise<void> {
    const { logger } = this;
    const WaitTimeout = 10_000;

    await iosDriver.relaunchApp('com.apple.mobileslideshow');

    await iosDriver.clickSelector(new IosAccessibilitiySelector('Library'));

    let loopCount = 0;
    logger.info(`IosResetService.clearPhotoImages loopCount: ${loopCount++}`);
    const imagesTry = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeImage'), { seconds: 3 });
    if (0 === imagesTry.length) {
      return;
    }

    await iosDriver.clickSelector(new IosAccessibilitiySelector('All Photos'));
    await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Select"`]'));

    const cancelButton = await iosDriver.rawDriver.$(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Cancel"`]').build());
    const windowRect = await iosDriver.rawDriver.getWindowRect();
    const cancelRect = await cancelButton.getElementRect(cancelButton.elementId);

    const images = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeImage'), { seconds: 3 });
    for (const image of images) {
      const rect = await image.getElementRect(image.elementId);

      if (boxBox(rect.x, rect.y, rect.width, rect.height, cancelRect.x, cancelRect.y, cancelRect.width, cancelRect.height)) {
        continue;
      }
      if (!boxBox(rect.x, rect.y, rect.width, rect.height, windowRect.x, windowRect.y, windowRect.width, windowRect.height)) {
        continue;
      }

      await image.click();
    }

    await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete'));
    await iosDriver.clickSelector(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete '`));
  }

  private async clearPhotoAlbums(iosDriver: IosWebDriver): Promise<void> {
    await iosDriver.relaunchApp('com.apple.mobileslideshow');
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Albums'));
    await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "See All"`]'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Edit'));

    const deleteDialogBtns = await iosDriver.waitElementsExist(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete,'`), { seconds: 3 });
    if (deleteDialogBtns.length === 0) {
      return;
    }
    await deleteDialogBtns[0].click();

    await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete'));
  }

  private async clearPhotosRecentlyDeleted(iosDriver: IosWebDriver): Promise<void> {
    const DeleteRepeatCount = 2;

    for await (const _ of loop(300, DeleteRepeatCount)) {
      await iosDriver.relaunchApp('com.apple.mobileslideshow');

      const recentlyDeleted = await iosDriver.scrollDownToSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Recently Deleted"`]'));
      await recentlyDeleted.click();

      const images = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeImage'), { seconds: 3 });
      if (0 === images.length) {
        continue;
      }

      await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Select"`]'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete All'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete From This iPhone'));
    }
  }

  private async clearPhotosSuggestionAndFeedbacks(iosDriver: IosWebDriver): Promise<void> {
    await iosDriver.relaunchApp('com.apple.Preferences');

    const photos = await iosDriver.scrollDownToSelector(new IosClassChainSelector('**/XCUIElementTypeCell[`label == "Photos"`]'));
    await photos.click();

    const resetMem = await iosDriver.scrollDownToSelector(new IosAccessibilitiySelector('ResetBlacklistedMemoryFeatures'));
    await resetMem.click();
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset'));

    const resetFeedback = await iosDriver.scrollDownToSelector(new IosAccessibilitiySelector('ResetPeopleFeedback'));
    await resetFeedback.click();
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset'));
  }

  private async enterFilesBrowseHome(iosDriver: IosWebDriver): Promise<void> {
    await iosDriver.relaunchApp('com.apple.DocumentsApp');

    const windowRect = await iosDriver.rawDriver.getWindowRect();

    // click bottom right
    let browserButtons = await iosDriver.rawDriver.$$(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Browse"`]').build());
    for (const button of browserButtons) {
      const pos = await button.getLocation();
      if (pos.x > windowRect.width / 2 && pos.y > windowRect.height / 2) {
        await button.click();
        break;
      }
    }

    // click top left
    browserButtons = await iosDriver.rawDriver.$$(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Browse"`]').build());
    for (const button of browserButtons) {
      const pos = await button.getLocation();
      if (pos.x < windowRect.width / 2 && pos.y < windowRect.height / 2) {
        await button.click();
        break;
      }
    }
  }

  private async clearFilesOnMyiPhone(iosDriver: IosWebDriver): Promise<void> {
    const windowRect = await iosDriver.rawDriver.getWindowRect();
    await this.enterFilesBrowseHome(iosDriver);

    await iosDriver.clickSelector(new IosAccessibilitiySelector('On My iPhone'));

    await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Icons'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('View Options'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.groupMenuButton.none'));

    const cellsTry = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeCell'), { seconds: 3 });
    if (cellsTry.length === 0) {
      return;
    }

    await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Select'));

    const cells = await iosDriver.rawDriver.$$(new IosClassChainSelector('**/XCUIElementTypeCell').build());
    for (const cell of cells) {
      const rect = await cell.getElementRect(cell.elementId);
      if (!boxBox(rect.x, rect.y, rect.width, rect.height, windowRect.x, windowRect.y, windowRect.width, windowRect.height)) {
        continue;
      }
      await cell.click();
    }
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete'));
  }

  private async clearFilesRecentlyDeleted(iosDriver: IosWebDriver): Promise<void> {
    const DeleteRepeatCount = 2;

    for await (const _ of loop(300, DeleteRepeatCount)) {
      await this.enterFilesBrowseHome(iosDriver);

      await iosDriver.clickSelector(new IosAccessibilitiySelector('Recently Deleted'));

      const cellsTry = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeCell'), { seconds: 3 });
      if (cellsTry.length === 0) {
        continue;
      }

      await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('Icons'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('View Options'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.groupMenuButton.none'));

      await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('Select'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete All'));
      await iosDriver.clickSelector(new IosAccessibilitiySelector('Delete'));
    }
  }

  private async resetSettings(iosDriver: IosWebDriver): Promise<void> {
    await iosDriver.relaunchApp('com.apple.Preferences');
    await iosDriver.clickSelector(new IosAccessibilitiySelector('General'));

    const reset = await iosDriver.scrollDownToSelector(new IosAccessibilitiySelector('Transfer or Reset iPhone'));
    await reset.click();

    await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Reset"`]'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset Keyboard Dictionary'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset Dictionary'));

    await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Reset"`]'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset Home Screen Layout'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset Home Screen'));

    await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Reset"`]'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset Location & Privacy'));
    await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset Settings'));

    for await (const _ of loopTime(300, 10000)) {
      try {
        await iosDriver.clickSelector(new IosAccessibilitiySelector('Trust'));
        break;
      } catch (e) {}
    }
  }

  private async removeWidgets(iosDriver: IosWebDriver): Promise<void> {
    await iosDriver.relaunchApp('com.apple.springboard');

    const MaxWidgetsCount = 100;
    // remove home widgets
    for await (const _ of loop(300, MaxWidgetsCount)) {
      const widgets = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeIcon[`label == "Waiting…"`]'), { seconds: 3 });
      if (0 === widgets.length) {
        break;
      }
      await iosDriver.removeWidget(widgets[0]);
    }

    // remove left widgets
    {
      const windowRect = await iosDriver.rawDriver.getWindowRect();
      const findLeftScrollView = async (): Promise<WDIOElement> => {
        for await (const counter of loop(1000, 3)) {
          await iosDriver.rawDriver.touchAction([
            {
              action: 'longPress',
              x: windowRect.width / 2,
              y: windowRect.height / 2,
            },
            {
              action: 'moveTo',
              x: windowRect.width - 10,
              y: windowRect.height / 2,
            },
            'release',
          ]);
          const scrollView = await iosDriver.rawDriver.$(new IosAccessibilitiySelector('left-of-home-scroll-view').build());
          if (scrollView.error) {
            if (!counter.isLast()) {
              continue;
            }
            throw new Error('scrollView not found');
          }
          return scrollView;
        }
        throw new Error('scrollView not found');
      };
      const scrollView = await findLeftScrollView();

      const skipLabels = ['Batteries'];
      for await (const _ of loop(300, MaxWidgetsCount)) {
        const widgets = await IosWebDriver.waitElemElementsExist(scrollView, new IosClassChainSelector('**/XCUIElementTypeIcon'), { seconds: 3 });

        const targetWidgets = await filterAsync(widgets, async (widget) => {
          const label = await widget.getAttribute('label');
          if (skipLabels.includes(label)) {
            return false;
          }
          return true;
        });
        if (0 === targetWidgets.length) {
          break;
        }
        const widget = targetWidgets[0];
        await iosDriver.removeWidget(widget);
      }
    }
  }
}
