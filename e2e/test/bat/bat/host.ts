import { job, test } from '@dogu-tech/dest';
import { expect } from '@playwright/test';
import { ElementHandle, Locator, Page } from 'playwright';
import { Key } from 'selenium-webdriver';
import { Driver } from '../../../src/chromedriver';
import { dostPlaywrightColor, launchDost } from '../../../src/dost';
import { replaceWebDriverAgentSigningStyle } from '../../../src/ios-helper';
import { getClockTime } from '../../../src/time';
import { Timer } from '../../../src/timer';
import { l10n } from './l10n';

export function runHost(random: number): void {
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
          xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/form/div/div/div[2]/div/div/input',
        },
        `test host ${random}`,
        {
          focusWindow: true,
        },
      );
      await Driver.clickElement(
        {
          xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[3]/div/button[2]',
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

    let mainPage: PageWrapper | undefined = undefined;
    const InstallTimeoutMs = 180000;
    const longTimeoutMs = 30000;

    test('Execute Dost', async () => {
      mainPage = new PageWrapper(await launchDost());
    });

    test('Dost Install externals', async () => {
      if (!mainPage) {
        throw new Error('mainPage is undefined');
      }
      await (await mainPage.waitForSelector('.chakra-checkbox__control', { timeout: longTimeoutMs })).click({ timeout: longTimeoutMs });
      await mainPage.getByText('Install', { exact: true }).first().click({ timeout: longTimeoutMs });
      await mainPage.getByText('Installing packages...', { exact: true }).first().waitFor({ timeout: InstallTimeoutMs, state: 'visible' });
      await mainPage.getByText('Installing packages...', { exact: true }).first().waitFor({ timeout: InstallTimeoutMs, state: 'hidden' });
    });

    test('Dost manual setup', async () => {
      if (!mainPage) {
        throw new Error('mainPage is undefined');
      }
      if (process.platform !== 'darwin') {
        return;
      }
      await mainPage.getByText('Manual Setup', { exact: true }).first().waitFor({ timeout: InstallTimeoutMs, state: 'visible' });
      replaceWebDriverAgentSigningStyle();

      await mainPage.getByText('Click here to build', { exact: true }).first().click({ timeout: longTimeoutMs });
      await mainPage.getByText('Installing packages...', { exact: true }).first().waitFor({ timeout: InstallTimeoutMs, state: 'hidden' });
      await mainPage.getByText('Check', { exact: true }).first().click({ timeout: longTimeoutMs });
      const buildButtons = await mainPage.getByText('Click here to build', { exact: true }).all();
      await buildButtons[1].click({ timeout: longTimeoutMs });
      await mainPage.getByText('Installing packages...', { exact: true }).first().waitFor({ timeout: InstallTimeoutMs, state: 'hidden' });
      await mainPage.getByText('Check', { exact: true }).first().click({ timeout: longTimeoutMs });
      await mainPage.getByText('Continue', { exact: true }).first().click({ timeout: InstallTimeoutMs });
    });

    test('Dost connect', async () => {
      if (!mainPage) {
        throw new Error('mainPage is undefined');
      }
      await (await mainPage.waitForSelector('.chakra-input', { timeout: longTimeoutMs })).click({ timeout: longTimeoutMs });
      await (await mainPage.waitForSelector('.chakra-input', { timeout: longTimeoutMs })).fill(token, { timeout: longTimeoutMs });
      await mainPage.getByText('Connect', { exact: true }).first().click({ timeout: InstallTimeoutMs });
      await Timer.wait(20000, 'dost launch');
      const isConnected = await mainPage.getByText('Connected', { exact: true }).first().isVisible({ timeout: longTimeoutMs });
      if (!isConnected) {
        throw new Error('Dost is not connected');
      }
    });

    test('Check host added', async () => {
      await Driver.clickElement(
        { xpath: '/html/body/div[3]/div/div[2]/div/div[2]/button' },
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
