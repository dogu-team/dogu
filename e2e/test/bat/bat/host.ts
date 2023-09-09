import { delay, loop } from '@dogu-tech/common';
import { job, test } from '@dogu-tech/dest';
import { findEndswith } from '@dogu-tech/node';
import { ElementHandle, expect, Locator, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { dostPlaywrightColor, launchDost } from '../../../src/dost';
import { copyIosDeviceAgentProject, replaceIosDeviceAgentSigningStyle, replaceWebDriverAgentSigningStyle } from '../../../src/ios-helper';
import { pathMap } from '../../../src/path-map';
import { Driver } from '../../../src/playwright-driver';
import { getClockTime } from '../../../src/time';
import { Timer } from '../../../src/timer';
import { l10n } from './l10n';

export function runHost(hostName: string, dost: Dost): void {
  job('Create host', () => {
    let token = '';

    test('Get new host token', async () => {
      // add-new-host
      await Driver.clickElement(
        {
          xpath: '//*[@access-id="add-new-host-btn"]',
        },
        {
          focusWindow: true,
        },
      );
      // add-host-form-name
      await Driver.sendKeys(
        {
          xpath: '//*[@access-id="add-host-form-name"]',
        },
        hostName,
        {
          focusWindow: true,
        },
      );

      await Driver.clickElement(
        {
          xpath: '//button[@form="new-host"]',
        },
        {
          focusWindow: true,
        },
      );
      // add-host-result
      const tokenText = await Driver.findElement(
        {
          xpath: '//*[@access-id="copy-token-input"]',
        },
        {
          focusWindow: true,
        },
      );

      token = (await tokenText.getAttribute('value'))?.valueOf() ?? '';
      console.log(`Token@@@@:${token}`);
    });

    while (!dost.nextTest()) {
      // wait for install
    }

    dost.testConnect(() => token);

    test('Check host added', async () => {
      await Driver.clickElement(
        { xpath: '//button[@aria-label="Close"]' },
        {
          focusWindow: true,
        },
      );

      await Driver.clickElement(
        { xpath: '//button[@access-id="refresh-btn"]' },
        {
          focusWindow: true,
        },
      );
      const status = await Driver.getText(
        {
          xpath: `//*[text()="${l10n('CONNECTED')}"]`,
        },
        {
          focusWindow: true,
        },
      );
      expect(status).toBe(l10n('CONNECTED'));
    });

    test('Click "..." before click use as device', async () => {
      await Timer.wait(20000, 'wait for device server initializing');
      await Driver.clickElement({ xpath: `//span[text()="${hostName}"]/../../../div[5]//button` });
    });

    test('Click use as device', async () => {
      await Driver.clickElement({ xpath: `//button[text()="${l10n('START_USING_AS_DEVICE')}"]` });
    });

    test('Click host menu before expect stop using as device', async () => {
      await Driver.clickElement({ xpath: '//*[@access-id="org-host-list-tab"]' });
    });

    test('Click "..." before expect stop using as device', async () => {
      await Driver.clickElement({ xpath: `//span[text()="${hostName}"]/../../../div[5]//button` });
    });

    test('Expect stop using as device', async () => {
      await Driver.findElement({ xpath: `//button[text()="${l10n('STOP_USING_AS_DEVICE')}"]` });
    });
  });
}

export class Dost {
  private mainPage: PageWrapper | undefined = undefined;
  private installGenerator: Generator<void>;
  InstallTimeoutMs = 10 * 60_000;
  longTimeoutMs = 30000;

  constructor() {
    this.installGenerator = this.InstallExternalsGenerator();
  }

  nextTest(): boolean {
    const { done } = this.installGenerator.next();
    return done === true;
  }

  private *InstallExternalsGenerator(): Generator<void> {
    test('Dost execute', async () => {
      this.mainPage = new PageWrapper(await launchDost());
    });
    yield;

    if (!process.env.DOGU_SKIP_DOGU_HOME_CLEANUP) {
      test('Dost Install externals', async () => {
        await (await this.mainPage!.waitForSelector('.chakra-checkbox__control', { timeout: this.longTimeoutMs })).click({ timeout: this.longTimeoutMs });
        await this.mainPage!.getByText('Install', { exact: true }).first().click({ timeout: this.longTimeoutMs });
      });
    }
    yield;

    if (!process.env.DOGU_SKIP_DOGU_HOME_CLEANUP) {
      test('Dost Install externals wait', async () => {
        const isInstalling = (await this.mainPage!.getByText('Installing packages...', { exact: true }).count()) > 0;
        if (!isInstalling) {
          return;
        }
        await this.mainPage!.getByText('Installing packages...', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'visible' });
        await this.mainPage!.getByText('Installing packages...', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'hidden' });
      });
    }
  }

  private *installIosSettings(): Generator<void> {
    test('Dost manual setup install wda', async () => {
      if (process.platform !== 'darwin') {
        return;
      }
      await this.mainPage!.getByText('Manual Setup', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'visible' });
      replaceWebDriverAgentSigningStyle();

      await this.mainPage!.getByText('Build & Check', { exact: true }).first().click({ timeout: this.longTimeoutMs });
    });
    yield;

    if (!process.env.DOGU_SKIP_DOGU_HOME_CLEANUP) {
      test('Dost manual setup install wda wait', async () => {
        if (process.platform !== 'darwin') {
          return;
        }
        await this.mainPage!.getByText('Building project...', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'hidden' });
      });
    }
    yield;

    if (!process.env.DOGU_SKIP_DOGU_HOME_CLEANUP) {
      test('Dost manual setup install ida', async () => {
        if (process.platform !== 'darwin') {
          return;
        }

        await copyIosDeviceAgentProject();
        replaceIosDeviceAgentSigningStyle();
        await delay(3000);
        await this.mainPage!.getByText('Build & Check', { exact: true }).first().click({ timeout: this.longTimeoutMs });
      });
    }
    yield;

    if (!process.env.DOGU_SKIP_DOGU_HOME_CLEANUP) {
      test('Dost manual setup install ida wait', async () => {
        if (process.platform !== 'darwin') {
          return;
        }

        await this.mainPage!.getByText('Building project...', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'hidden' });
        await delay(1000);

        await this.mainPage!.getByText('Continue', { exact: true }).first().click({ timeout: this.InstallTimeoutMs });
      });
    }
  }

  testConnect(token: () => string): void {
    test('Dost connect', async () => {
      console.log(`Dost connect ${token()}`);
      await (await this.mainPage!.waitForSelector('.chakra-input', { timeout: this.longTimeoutMs })).click({ timeout: this.longTimeoutMs });
      await (await this.mainPage!.waitForSelector('.chakra-input', { timeout: this.longTimeoutMs })).fill(token(), { timeout: this.longTimeoutMs });
      await this.mainPage!.getByText('Connect', { exact: true }).first().click({ timeout: this.InstallTimeoutMs });

      let isConnected = false;
      for await (const _ of loop(3000, 60)) {
        isConnected = await this.mainPage!.getByText('Connected', { exact: true }).first().isVisible({ timeout: this.longTimeoutMs });
        if (isConnected) {
          break;
        }
      }
      if (!isConnected) {
        throw new Error('Dost is not connected');
      }
    });
  }

  checkLog(): void {
    test('Dogu-Agent check critical error log', async () => {
      const dostLogsPath = path.resolve(pathMap.root, 'nm-space/projects/dost/generated/logs');
      const criticalKeyword = ['unhandledRejection', 'uncaughtException', 'panic:'];
      const allLogFiles = await findEndswith(dostLogsPath, '.log');
      const logDetected: {
        file: string;
        keyword: string;
        contents: string[];
      }[] = [];
      for (const file of allLogFiles) {
        const contents = (await fs.promises.readFile(file, { encoding: 'utf-8' })).split('\n');
        for (let i = 0; i < contents.length; i++) {
          const content = contents[i];
          for (const keyword of criticalKeyword) {
            if (content.includes(keyword)) {
              const min = Math.max(0, i - 20);
              const max = Math.min(contents.length, i + 20);
              logDetected.push({
                file: file,
                keyword: keyword,
                contents: contents.slice(min, max),
              });
            }
          }
        }
      }
      if (logDetected.length > 0) {
        console.error(`Critical error log(${logDetected.length}) detected`);
        // for (const log of logDetected) {
        for (let i = 0; i < logDetected.length; i++) {
          const log = logDetected[i];
          console.error(`>>> LOG DUMP(${i}) start <<<`);
          console.error(`> File: ${log.file}, Keyword ${log.keyword}`);
          console.error(log.contents.join('\n'));
          console.error(`>>> LOG DUMP(${i}) end <<<`);
        }
        throw new Error('Critical error log detected');
      }
    });
  }
}

class PageWrapper {
  constructor(private readonly page: Page) {}

  getByText(
    text: string,
    options?: {
      exact?: boolean;
    },
  ): Locator {
    console.log(`${dostPlaywrightColor} ${getClockTime()} getByText: ${text}`);
    return this.page.getByText(text, options);
  }

  waitForSelector(
    selector: string,
    options?: {
      timeout?: number;
    },
  ): Promise<ElementHandle<SVGElement | HTMLElement>> {
    console.log(`${dostPlaywrightColor} ${getClockTime()} waitForSelector: ${selector}`);
    return this.page.waitForSelector(selector, options);
  }
}
