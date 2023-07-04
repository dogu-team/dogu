import { delay } from '@dogu-tech/common';
import { job, test } from '@dogu-tech/dest';
import { expect } from '@playwright/test';
import { ElementHandle, Locator, Page } from 'playwright';
import { Key } from 'selenium-webdriver';
import { Driver } from '../../../src/chromedriver';
import { dostPlaywrightColor, launchDost } from '../../../src/dost';
import { copyIosDeviceAgentProject, replaceIosDeviceAgentSigningStyle, replaceWebDriverAgentSigningStyle } from '../../../src/ios-helper';
import { getClockTime } from '../../../src/time';
import { Timer } from '../../../src/timer';
import { l10n } from './l10n';

export function runHost(random: number, dost: Dost): void {
  job('Create host', () => {
    let token = '';
    test('Go to host page', async () => {
      await Driver.clickElement({ xpath: '//*[@access-id="project-layout-org-name"]' });
    });

    test('Click host menu', async () => {
      // side-bar-host
      await Driver.clickElement({ xpath: '//*[@access-id="side-bar-host"]' });
    });

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
        `test host ${random}`,
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

      token = await tokenText.getAttribute('value');
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

      await Driver.sendKeys({ xpath: '/html/body/div[1]/div/section/main/div/div/div/div[1]/div/button' }, Key.RETURN, {
        focusWindow: true,
      });
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
  });
}

export class Dost {
  private mainPage: PageWrapper | undefined = undefined;
  private installGenerator: Generator<void>;
  InstallTimeoutMs = 180000;
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

    test('Dost Install externals', async () => {
      await (await this.mainPage!.waitForSelector('.chakra-checkbox__control', { timeout: this.longTimeoutMs })).click({ timeout: this.longTimeoutMs });
      await this.mainPage!.getByText('Install', { exact: true }).first().click({ timeout: this.longTimeoutMs });
    });
    yield;

    test('Dost Install externals wait', async () => {
      await this.mainPage!.getByText('Installing packages...', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'visible' });
      await this.mainPage!.getByText('Installing packages...', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'hidden' });
    });
    yield;

    test('Dost skip manual setup install', async () => {
      if (process.platform !== 'darwin') {
        await this.mainPage!.getByText('Continue', { exact: true }).first().click({ timeout: this.InstallTimeoutMs });
      }
    });

    test('Dost manual setup install wda', async () => {
      if (process.platform !== 'darwin') {
        return;
      }
      await this.mainPage!.getByText('Manual Setup', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'visible' });
      replaceWebDriverAgentSigningStyle();

      await this.mainPage!.getByText('Build & Check', { exact: true }).first().click({ timeout: this.longTimeoutMs });
    });
    yield;

    test('Dost manual setup install wda wait', async () => {
      if (process.platform !== 'darwin') {
        return;
      }
      await this.mainPage!.getByText('Building project...', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'hidden' });
    });
    yield;

    test('Dost manual setup install ida', async () => {
      if (process.platform !== 'darwin') {
        return;
      }

      await copyIosDeviceAgentProject();
      replaceIosDeviceAgentSigningStyle();
      await delay(3000);
      await this.mainPage!.getByText('Build & Check', { exact: true }).first().click({ timeout: this.longTimeoutMs });
    });
    yield;

    test('Dost manual setup install ida wait', async () => {
      if (process.platform !== 'darwin') {
        return;
      }

      await this.mainPage!.getByText('Building project...', { exact: true }).first().waitFor({ timeout: this.InstallTimeoutMs, state: 'hidden' });
      await delay(1000);

      await this.mainPage!.getByText('Continue', { exact: true }).first().click({ timeout: this.InstallTimeoutMs });
    });

    test('Set API url', async () => {
      await this.mainPage!.getByText('Set', { exact: true }).first().click({ timeout: this.longTimeoutMs });
      await this.mainPage!.getByText('Finish', { exact: true }).first().click({ timeout: this.longTimeoutMs });
    });
  }

  testConnect(token: () => string): void {
    test('Dost connect', async () => {
      console.log(`Dost connect ${token()}`);
      await (await this.mainPage!.waitForSelector('.chakra-input', { timeout: this.longTimeoutMs })).click({ timeout: this.longTimeoutMs });
      await (await this.mainPage!.waitForSelector('.chakra-input', { timeout: this.longTimeoutMs })).fill(token(), { timeout: this.longTimeoutMs });
      await this.mainPage!.getByText('Connect', { exact: true }).first().click({ timeout: this.InstallTimeoutMs });
      await Timer.wait(20000, 'dost launch');
      const isConnected = await this.mainPage!.getByText('Connected', { exact: true }).first().isVisible({ timeout: this.longTimeoutMs });
      if (!isConnected) {
        throw new Error('Dost is not connected');
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
