import { expect, job, test } from '@dogu-tech/dest';
import { Key } from 'selenium-webdriver';
import { Driver } from '../../../src/chromedriver';
import { launchDost } from '../../../src/dost';
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

    test('Execute Dost', async () => {
      const mainPage = await launchDost();
      const delayMs = 300;
      const longTimeoutMs = 30000;
      const shortTimeoutMs = 1000;
      const clickOption = { delay: 300, timeout: shortTimeoutMs };

      await (await mainPage.waitForSelector('.chakra-checkbox__control', { timeout: longTimeoutMs })).click({ trial: true });
      for (let index = 0; index < 100; index++) {
        const isCheckboxVisible = await mainPage.locator('.chakra-checkbox__control').first().isVisible({ timeout: shortTimeoutMs });
        const isNextVisible = await mainPage.getByText('Next', { exact: true }).first().isVisible({ timeout: shortTimeoutMs });
        const isInstallVisible = await mainPage.getByText('Install', { exact: true }).first().isVisible({ timeout: shortTimeoutMs });
        if (!isCheckboxVisible && !isNextVisible && !isInstallVisible) {
          break;
        }

        try {
          if (isInstallVisible) {
            await mainPage.getByText('Install', { exact: true }).click(clickOption);
            await Timer.wait(delayMs, 'dost launch. after click install');
          }
          if (isCheckboxVisible) {
            await mainPage.locator('.chakra-checkbox__control').first().click(clickOption);
            await Timer.wait(delayMs, 'dost launch. after click checkbox');
          }
          if (isNextVisible) {
            await mainPage.getByText('Next', { exact: true }).click(clickOption);
            await Timer.wait(delayMs, 'dost launch. after click next');
          }
        } catch (e: unknown) {
          console.error(`Dost launch. pass error`, e);
        }

        await Timer.wait(delayMs, 'dost launch. after click');
      }
      await mainPage.getByPlaceholder('token', { exact: true }).fill(token);
      await Timer.wait(delayMs, 'dost launch');
      await mainPage.getByText('Connect', { exact: true }).click(clickOption);
      await Timer.wait(delayMs, 'dost launch');
      if (await mainPage.locator('.chakra-alert').isVisible({ timeout: longTimeoutMs })) {
        const contents = (await mainPage.locator('.chakra-alert').allTextContents()).join('\n');
        throw new Error(`Dost connect failed. contents: ${contents}`);
      }
      // const hostAgent = ProcessManager.spawn('yarn', ['workspace', 'host-agent', 'run', 'start'], {
      //   name: 'host-agent',
      //   printLog: true,
      //   cwd: pathMap.root,
      // });
      // await Timer.waitStream(hostAgent, 'ready - connected server with', 3 * 60 * 1000);
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
