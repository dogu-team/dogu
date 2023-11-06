import { Serial, SerialPrintable } from '@dogu-private/types';
import { delay, filterAsync, loop, loopTime, PrefixLogger, Repeat, retry, usingAsnyc } from '@dogu-tech/common';
import { boxBox } from 'intersects';
import { AppiumContextImpl, WDIOElement } from '../../../appium/appium.context';
import { IdeviceInstaller } from '../../externals/cli/ideviceinstaller';
import { WebdriverAgentProcess } from '../../externals/cli/webdriver-agent-process';
import { IdeviceDiagnostics, Xctrace } from '../../externals/index';
import {
  IosAccessibilitiySelector,
  IosButtonPredicateStringSelector,
  IosClassChainSelector,
  IosPredicateStringSelector,
  IosWebDriver,
} from '../../externals/webdriver/ios-webdriver';
import { CheckTimer } from '../../util/check-time';

interface BlockAppInfo {
  bundleId: string;
  uninstall: true;
}

const BlockAppList: BlockAppInfo[] = [
  // disable
  {
    bundleId: 'com.apple.tv',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Maps',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Health',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.mobilecal',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.mobiletimer',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.mobilemail',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.mobilenotes',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.podcasts',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.reminders',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.facetime',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.weather',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.stocks',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Home',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.iBooks',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.MobileStore',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Bridge', // watch
    uninstall: true,
  },
  {
    bundleId: 'com.apple.MobileAddressBook', // contacts
    uninstall: true,
  },
  {
    bundleId: 'com.apple.shortcuts',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.freeform',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.tips',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.VoiceMemos',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.compass',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Magnifier',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.calculator',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Fitness',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Passbook',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Music',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Translate',
    uninstall: true,
  },
];
export interface IosResetInfo {
  lastResetTime: number;
}

const ResetExpireTime = 10 * 60 * 1000;
const SleepBeforeTerminate = 2000;
const SleepBeforeTerminateLong = 4000;

class IosResetHelper {
  constructor(private iosDriver: IosWebDriver) {}

  async enterFilesBrowseHome(): Promise<void> {
    const { iosDriver } = this;
    const windowRect = await iosDriver.rawDriver.getWindowRect();

    // click bottom right
    let browserButtons = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Browse"`]'), { seconds: 3 });
    for (const button of browserButtons) {
      const pos = await button.getLocation();
      if (pos.x > windowRect.width / 2 && pos.y > windowRect.height / 2) {
        await button.click();
        break;
      }
    }

    // click top left
    browserButtons = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Browse"`]'), { seconds: 3 });
    for (const button of browserButtons) {
      const pos = await button.getLocation();
      if (pos.x < windowRect.width / 2 && pos.y < windowRect.height / 2) {
        await button.click();
        break;
      }
    }
  }
}

const ClearRepeatCount = 1;

export class IosResetService {
  private timer: CheckTimer;
  private _state: string | null = null;
  private static map: Map<Serial, IosResetInfo> = new Map(); // Hold for process lifetime
  constructor(
    private serial: Serial,
    private logger: SerialPrintable,
  ) {
    this.timer = new CheckTimer(this.logger);
  }

  get isResetting(): boolean {
    return this._state !== null;
  }

  get state(): string | null {
    return this._state;
  }

  async makeDirty(): Promise<void> {
    IosResetService.map.delete(this.serial);
    await Promise.resolve();
  }

  async isDirty(): Promise<boolean> {
    return await IosResetService.isDirty(this.serial);
  }

  static async isDirty(serial: Serial): Promise<boolean> {
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
  async reset(appiumContext: AppiumContextImpl, wda: WebdriverAgentProcess): Promise<void> {
    const { serial, logger } = this;
    await retry(
      async (): Promise<void> => {
        const driver = appiumContext.driver();
        if (!driver) {
          throw new Error(`IosResetService.clearSafariCache driver is null`);
        }
        const iosDriver = new IosWebDriver(driver, wda, logger);
        const helper = new IosResetHelper(iosDriver);

        await usingAsnyc(
          {
            create: async () => {
              this.logger.info(`IosResetService.reset begin`, { serial });
              await delay(0);
            },
            dispose: async () => {
              this._state = null;
              this.logger.info(`IosResetService.reset end`, { serial });
              await delay(0);
            },
          },
          async () => {
            await iosDriver.home();
            await this.check('IosResetService.reset.removeSystemApps', this.removeSystemApps());
            await iosDriver.home();
            await this.check('IosResetService.reset.logoutAppleAccount', this.logoutAppleAccount(iosDriver));
            await this.check('IosResetService.reset.clearSafariCache', this.clearSafariCache(iosDriver));
            await this.check('IosResetService.reset.clearPhotoImages', this.clearPhotoImages(iosDriver));
            await this.check('IosResetService.reset.clearPhotoAlbums', this.clearPhotoAlbums(iosDriver));
            await this.check('IosResetService.reset.clearPhotosRecentlyDeleted', this.clearPhotosRecentlyDeleted(iosDriver));
            await this.check('IosResetService.reset.clearPhotosSuggestionAndFeedbacks', this.clearPhotosSuggestionAndFeedbacks(iosDriver));
            await this.check('IosResetService.reset.clearFilesOnMyiPhone', this.clearFilesOnMyiPhone(iosDriver, helper));
            await this.check('IosResetService.reset.clearFilesTags', this.clearFilesTags(iosDriver, helper));
            await this.check('IosResetService.reset.clearFilesRecentlyDeleted', this.clearFilesRecentlyDeleted(iosDriver, helper));
            await this.check('IosResetService.reset.resetSettings', this.resetSettings(iosDriver));
            await this.check('IosResetService.reset.removeWidgets', this.removeWidgets(iosDriver));
            await this.check('IosResetService.reset.clearNotifications', this.clearNotifications(iosDriver));
            await this.check('IosResetService.reset.removeUserApps', this.removeUserApps()); // last step because this removes appium
            await this.check(
              'IosResetService.reset.restart',
              retry(async (): Promise<string> => await IdeviceDiagnostics.restart(serial, logger), { retryCount: 5, retryInterval: 1000 }).catch((e) => {
                logger.error(`IosResetService.reset.restart error but tried many times so ignore error`, { serial, error: e });
              }),
            );
            await this.check('IosResetService.reset.waitUntilDisonnected', Xctrace.waitUntilDisonnected(serial, logger));
            IosResetService.map.set(serial, { lastResetTime: Date.now() });
          },
        );
      },
      { retryCount: 5, retryInterval: 1000, printable: new PrefixLogger(logger, 'IosResetService.reset') },
    );
  }

  private async removeSystemApps(): Promise<void> {
    const installer = new IdeviceInstaller(this.serial, this.logger);
    const uninstallApps = BlockAppList.filter((item) => item.uninstall).map((item) => item.bundleId);
    for (const app of uninstallApps) {
      await installer.uninstallApp(app);
    }
  }

  private async removeUserApps(): Promise<void> {
    const installer = new IdeviceInstaller(this.serial, this.logger);
    const userApps = await installer.getUserApps();
    for (const userApp of userApps) {
      await installer.uninstallApp(userApp.bundleId);
    }
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async logoutAppleAccount(iosDriver: IosWebDriver): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.Preferences');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.terminateApp('com.apple.Preferences');
        },
      },
      async () => {
        await iosDriver.clickSelector(new IosAccessibilitiySelector('APPLE_ACCOUNT'));

        await delay(1000);

        const signouts = await iosDriver.waitElementsExist(new IosAccessibilitiySelector('AAUIDeleteButtonSpecifierID'), { seconds: 3 });
        if (0 === signouts.length) {
          return;
        }

        const signout = signouts[0];
        await signout.click();
      },
    );
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async clearSafariCache(iosDriver: IosWebDriver): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.Preferences');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.terminateApp('com.apple.Preferences');
        },
      },
      async () => {
        await iosDriver.clickSelector(new IosAccessibilitiySelector('Safari'));

        await iosDriver.clickSelector(new IosAccessibilitiySelector('CLEAR_HISTORY_AND_DATA'));

        await iosDriver.clickSelector(new IosAccessibilitiySelector('Clear History and Data'));

        await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Close Tabs"`]'));
      },
    );
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async clearPhotoImages(iosDriver: IosWebDriver): Promise<void> {
    const { logger } = this;

    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.mobileslideshow');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.terminateApp('com.apple.mobileslideshow');
        },
      },
      async () => {
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Library'));

        let loopCount = 0;
        logger.info(`IosResetService.clearPhotoImages loopCount: ${loopCount++}`);
        const imagesTry = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeImage'), { seconds: 3 });
        if (0 === imagesTry.length) {
          return;
        }

        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('All Photos'));
        await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Select"`]'));

        const cancelButton = await iosDriver.waitElementExist(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Cancel"`]'), { seconds: 3 });
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

        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Delete'));
        await iosDriver.clickSelector(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete '`));
      },
    );
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async clearPhotoAlbums(iosDriver: IosWebDriver): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.mobileslideshow');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.terminateApp('com.apple.mobileslideshow');
        },
      },
      async () => {
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Albums'));
        await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "See All"`]'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Edit'));

        const deleteDialogBtns = await iosDriver.waitElementsExist(new IosPredicateStringSelector(`type == 'XCUIElementTypeButton' && name CONTAINS 'Delete,'`), { seconds: 3 });
        if (deleteDialogBtns.length === 0) {
          return;
        }
        await deleteDialogBtns[0].click();

        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Delete'));
      },
    );
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async clearPhotosRecentlyDeleted(iosDriver: IosWebDriver): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.mobileslideshow');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminateLong);
          await iosDriver.terminateApp('com.apple.mobileslideshow');
        },
      },
      async () => {
        const recentlyDeleted = await iosDriver.scrollDownToSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Recently Deleted"`]'));
        await recentlyDeleted.click();

        await delay(2000); // wait for change. It's hard to determine loading done

        const images = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeImage'), { seconds: 3 });
        if (0 === images.length) {
          return;
        }

        await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Select"`]'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Delete All'));
        try {
          await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Delete From This iPhone'));
        } catch (e) {
          await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Delete Photo'));
        }
      },
    );
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async clearPhotosSuggestionAndFeedbacks(iosDriver: IosWebDriver): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.Preferences');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.terminateApp('com.apple.Preferences');
        },
      },
      async () => {
        await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeCell[`label == "Photos"`]'));

        await iosDriver.clickSelector(new IosAccessibilitiySelector('ResetPeopleFeedback'));
        await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset'));

        await iosDriver.clickSelector(new IosAccessibilitiySelector('ResetBlacklistedMemoryFeatures'));
        await iosDriver.clickSelector(new IosAccessibilitiySelector('Reset'));
      },
    );
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async clearFilesOnMyiPhone(iosDriver: IosWebDriver, helper: IosResetHelper): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.DocumentsApp');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.terminateApp('com.apple.DocumentsApp');
        },
      },
      async () => {
        const windowRect = await iosDriver.rawDriver.getWindowRect();
        await helper.enterFilesBrowseHome();

        await iosDriver.clickSelector(new IosAccessibilitiySelector('On My iPhone'));

        await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Icons'));
        await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
        const viewOptions = await iosDriver.waitElementsExist(new IosButtonPredicateStringSelector('View Options'), { seconds: 2 });
        if (0 < viewOptions.length) {
          await viewOptions[0].click();
          await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.groupMenuButton.none'));
        }

        const cellsTry = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeCell'), { seconds: 3 });
        if (cellsTry.length === 0) {
          return;
        }

        await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Select'));

        const cells = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeCell'), { seconds: 3 });
        for (const cell of cells) {
          const rect = await cell.getElementRect(cell.elementId);
          if (!boxBox(rect.x, rect.y, rect.width, rect.height, windowRect.x, windowRect.y, windowRect.width, windowRect.height)) {
            continue;
          }
          await cell.click();
        }
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Delete'));
      },
    );
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async clearFilesTags(iosDriver: IosWebDriver, helper: IosResetHelper): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.DocumentsApp');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.terminateApp('com.apple.DocumentsApp');
        },
      },
      async () => {
        await helper.enterFilesBrowseHome();

        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('More'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Edit'));
        for await (const _ of loop(100)) {
          const remove = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeImage[`label == "remove"`]'), { seconds: 3 });
          if (0 === remove.length) {
            break;
          }
          await remove[0].click();
          await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeButton[`label == "Delete"`]'));
        }
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Done'));
      },
    );
  }

  @Repeat({ repeatCount: ClearRepeatCount, repeatInterval: 100 })
  private async clearFilesRecentlyDeleted(iosDriver: IosWebDriver, helper: IosResetHelper): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.relaunchApp('com.apple.DocumentsApp');
        },
        dispose: async () => {
          await delay(SleepBeforeTerminateLong);
          await iosDriver.terminateApp('com.apple.DocumentsApp');
        },
      },
      async () => {
        await helper.enterFilesBrowseHome();

        await iosDriver.clickSelector(new IosAccessibilitiySelector('Recently Deleted'));
        await delay(1000);

        const cellsTry = await iosDriver.waitElementsExist(new IosClassChainSelector('**/XCUIElementTypeCell'), { seconds: 3 });
        if (cellsTry.length === 0) {
          return;
        }

        await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Icons'));
        await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
        const viewOptions = await iosDriver.waitElementsExist(new IosButtonPredicateStringSelector('View Options'), { seconds: 2 });
        if (0 < viewOptions.length) {
          await viewOptions[0].click();
          await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.groupMenuButton.none'));
        }

        await iosDriver.clickSelector(new IosAccessibilitiySelector('DOC.itemCollectionMenuButton.Ellipsis'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Select'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Delete All'));
        await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Delete'));
      },
    );
  }

  private async resetSettings(iosDriver: IosWebDriver): Promise<void> {
    let isResetKeyboardDone = false;
    let isResetHomeDone = false;
    await retry(
      async () =>
        await usingAsnyc(
          {
            create: async () => {
              await iosDriver.home();
              await iosDriver.relaunchApp('com.apple.Preferences');
            },
            dispose: async () => {
              await delay(SleepBeforeTerminate);
              await iosDriver.terminateApp('com.apple.Preferences');
            },
          },
          async () => {
            await iosDriver.clickSelector(new IosAccessibilitiySelector('General'));

            await iosDriver.clickSelector(new IosAccessibilitiySelector('Transfer or Reset iPhone'));

            if (!isResetKeyboardDone) {
              await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Reset"`]'));
              await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Reset Keyboard Dictionary'));
              await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Reset Dictionary'));
              isResetKeyboardDone = true;
            }

            if (!isResetHomeDone) {
              await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Reset"`]'));
              await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Reset Home Screen Layout'));
              await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Reset Home Screen'));
              isResetHomeDone = true;
            }

            await iosDriver.clickSelector(new IosClassChainSelector('**/XCUIElementTypeStaticText[`label == "Reset"`]'));
            await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Reset Location & Privacy'));
            await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Reset Settings'));

            for await (const _ of loopTime({ period: { milliseconds: 300 }, expire: { seconds: 10 } })) {
              try {
                await iosDriver.clickSelector(new IosButtonPredicateStringSelector('Trust'));
                break;
              } catch (e) {}
            }
          },
        ),
      { retryCount: 7, retryInterval: 1000, printable: new PrefixLogger(this.logger, 'IosResetService.resetSettings') },
    );
  }

  private async removeWidgets(iosDriver: IosWebDriver): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.home();
          await iosDriver.home();
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.home();
        },
      },
      async () => {
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
              const scrollView = await iosDriver.waitElementsExist(new IosAccessibilitiySelector('left-of-home-scroll-view'), { seconds: 3 });
              if (0 === scrollView.length) {
                if (!counter.isLast()) {
                  continue;
                }
                throw new Error('scrollView not found');
              }
              return scrollView[0];
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
      },
    );
  }

  private async clearNotifications(iosDriver: IosWebDriver): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.openNotificationCenter();
        },
        dispose: async () => {
          await delay(SleepBeforeTerminate);
          await iosDriver.home();
        },
      },
      async () => {
        for await (const _ of loop(500)) {
          const elems = await iosDriver.waitElementsExist(new IosAccessibilitiySelector('NotificationCell'), { seconds: 3 });
          if (0 === elems.length) {
            break;
          }
          const elemAndLoc = await Promise.all(
            elems.map(async (elem) => {
              const elemPos = await elem.getLocation();
              return { elem, elemPos };
            }),
          );
          elemAndLoc.sort((a, b) => a.elemPos.y - b.elemPos.y);
          const elem = elemAndLoc[0].elem;

          const elemPos = await elem.getLocation();
          const elemSize = await elem.getSize();
          const elemCenter = {
            x: elemPos.x + elemSize.width / 2,
            y: elemPos.y + elemSize.height / 2,
          };

          // longpress to left
          await iosDriver.rawDriver.touchAction([
            {
              action: 'longPress',
              x: Math.floor(elemCenter.x + elemSize.width * 0.48),
              y: elemCenter.y,
            },
            {
              action: 'moveTo',
              x: Math.floor(elemCenter.x - elemSize.width * 0.48),
              y: elemCenter.y,
            },
            'release',
          ]);
        }
      },
    );
  }

  async check<T>(name: string, promise: Promise<T>): Promise<T> {
    this._state = name;
    return this.timer.check(name, promise);
  }
}
