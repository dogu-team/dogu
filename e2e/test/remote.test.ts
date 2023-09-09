import { newCleanNodeEnv } from '@dogu-tech/node';
import { Browser, chromium, expect, Page, test } from '@playwright/test';
import { spawn } from 'child_process';
import fs from 'fs';
import JSON5 from 'json5';
import path from 'path';

const doguConfigJsonFileName = 'dogu.config.json';
const doJestAndroidWeb = false;
const doJestAndroidApp = false;
const doJestWindowsWeb = false;
const doJestMacosWeb = true;

const serverUrl = '';
const userEmail = '';
const userPassword = '';
const organizationName = '';
const projectName = '';

async function concatText(textElements: Awaited<ReturnType<Page['$$']>>): Promise<string> {
  const concated = (await Promise.all(textElements.map(async (element) => element.textContent())))
    .filter((text) => text)
    .map((text) => text as string)
    .join('');
  console.log('concated:', concated);
  return concated;
}

async function spawnAndWait(command: string, cwd: string): Promise<number> {
  return await new Promise<number>((resolve) => {
    const child = spawn(command, {
      cwd,
      env: newCleanNodeEnv(),
      shell: true,
    });
    child.on('error', (error) => {
      console.error('command error:', command, error);
    });
    const onErrorForResolve = (error: Error): void => {
      resolve(1);
    };
    child.on('error', onErrorForResolve);
    child.on('spawn', () => {
      child.off('error', onErrorForResolve);
    });
    child.on('exit', (code, signal) => {
      console.log('command exit:', command, code, signal);
      if (code === null) {
        resolve(1);
      } else {
        resolve(code);
      }
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
      console.log('command stdout:', command, data);
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
      console.log('command stderr:', command, data);
    });
  });
}

let browser: Browser | undefined;
let page: Page;
const repoDir = path.resolve(process.cwd(), '../..');
console.log('repoDir', repoDir);

test.beforeAll(async () => {
  browser = await chromium.launch({ headless: false });
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
  await browser?.close();
});

test('goto', async () => {
  await page.goto(serverUrl);
});

test('login', async () => {
  await page.fill('//*[@id="__next"]/div/div[1]/div[2]/div[2]/div[1]/form/div[1]/input', userEmail);
  await page.fill('//*[@id="__next"]/div/div[1]/div[2]/div[2]/div[1]/form/div[2]/span/input', userPassword);
  await page.click('//*[@id="__next"]/div/div[1]/div[2]/div[2]/div[1]/form/button');
});

test('go to tutorial', async () => {
  await page.getByText(organizationName, { exact: true }).click({ timeout: 10000, force: true });
  await page.click('//a[@access-id="side-bar-project"]');
  await page.click(`//a[contains(text(),${projectName})]`);
  await page.click('//a[@access-id="project-side-bar-remote"]');
  await page.click('//button/span[contains(text(),"Tutorial")]/..');
});

test('go to webdriver jest', async () => {
  await page.click('//button/p[contains(text(),"WebdriverIO")]/..');
  await page.click('//button[contains(text(),"Jest")]');

  await expect(page.locator('//*[@id="framework-selector"]/../../*[contains(.,"Jest")]')).toBeVisible();
  await expect(page.locator('//*[@id="platform-selector"]/../../*[contains(.,"Android")]')).toBeVisible();
  // await expect(page.locator('//*[@id="target-selector"]/../../*[contains(.,"Web")]')).toBeVisible();
});

if (doJestAndroidApp) {
  test.describe('test jest android app', () => {
    let cwd = '';

    test('change jest android app', async () => {
      await page.click('//*[@id="target-selector"]/../../span/div');
      await page.click('//*[@id="target-selector_list_1"]');

      await expect(page.locator('//*[@id="framework-selector"]/../../*[contains(.,"Jest")]')).toBeVisible();
      await expect(page.locator('//*[@id="platform-selector"]/../../*[contains(.,"Android")]')).toBeVisible();
      await expect(page.locator('//*[@id="target-selector"]/../../*[contains(.,"App")]')).toBeVisible();
    });

    test('change directory', async () => {
      const textElements = await page.$$('//*[@id="project-setup"]/div[2]/div[2]/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, repoDir);
      expect(code).toBe(0);

      cwd = path.resolve(repoDir, command.replace('cd ', ''));
    });

    test('install dependencies', async () => {
      const textElements = await page.$$('//*[@id="install-dependencies"]/div[2]/div/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, cwd);
      expect(code).toBe(0);
    });

    test('set capabilities', async () => {
      const textElements = await page.$$('//*[@id="set-capabilities"]/div[2]/div/pre/code/span');
      const config = await concatText(textElements);
      const parse = (): unknown | null => {
        try {
          JSON5.parse(config);
          return null;
        } catch (error) {
          console.error('config parse error:', error);
          return error;
        }
      };
      expect(parse()).toBeNull();
      await fs.promises.writeFile(path.resolve(cwd, doguConfigJsonFileName), config);
    });

    test('upload sample app', async () => {
      await page.click('//*[@id="upload-sample-app"]//button');
    });

    test('run test', async () => {
      test.setTimeout(60_000);
      const textElements = await page.$$('//*[@id="run-test"]/div[2]/div/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, cwd);
      expect(code).toBe(0);
    });
  });
}

if (doJestAndroidWeb) {
  test.describe('test jest android web', () => {
    let cwd = '';

    test('ensure jest android web', async () => {
      await page.click('//*[@id="target-selector"]/../../span/div');
      await page.click('//*[@id="target-selector_list_0"]');

      await expect(page.locator('//*[@id="framework-selector"]/../../*[contains(.,"Jest")]')).toBeVisible();
      await expect(page.locator('//*[@id="platform-selector"]/../../*[contains(.,"Android")]')).toBeVisible();
      await expect(page.locator('//*[@id="target-selector"]/../../*[contains(.,"Web")]')).toBeVisible();
    });

    test('change directory', async () => {
      const textElements = await page.$$('//*[@id="project-setup"]/div[2]/div[2]/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, repoDir);
      expect(code).toBe(0);

      cwd = path.resolve(repoDir, command.replace('cd ', ''));
    });

    test('install dependencies', async () => {
      const textElements = await page.$$('//*[@id="install-dependencies"]/div[2]/div/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, cwd);
      expect(code).toBe(0);
    });

    test('set capabilities', async () => {
      const textElements = await page.$$('//*[@id="set-capabilities"]/div[2]/div/pre/code/span');
      const config = await concatText(textElements);
      const parse = (): unknown | null => {
        try {
          JSON5.parse(config);
          return null;
        } catch (error) {
          console.error('config parse error:', error);
          return error;
        }
      };
      expect(parse()).toBeNull();
      await fs.promises.writeFile(path.resolve(cwd, doguConfigJsonFileName), config);
    });

    test('run test', async () => {
      test.setTimeout(60_000);
      const textElements = await page.$$('//*[@id="run-test"]/div[2]/div/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, cwd);
      expect(code).toBe(0);
    });
  });
}

if (doJestWindowsWeb) {
  test.describe('test jest windows web', () => {
    let cwd = '';

    test('change jest windows web', async () => {
      await page.click('//*[@id="target-selector"]/../../span/div');
      await page.click('//*[@id="target-selector_list_0"]');

      await page.click('//*[@id="platform-selector"]/../../span/div');
      await page.click('//*[@id="platform-selector_list_2"]');

      await expect(page.locator('//*[@id="framework-selector"]/../../*[contains(.,"Jest")]')).toBeVisible();
      await expect(page.locator('//*[@id="platform-selector"]/../../*[contains(.,"Windows")]')).toBeVisible();
      await expect(page.locator('//*[@id="target-selector"]/../../*[contains(.,"Web")]')).toBeVisible();
    });

    test('change directory', async () => {
      const textElements = await page.$$('//*[@id="project-setup"]/div[2]/div[2]/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, repoDir);
      expect(code).toBe(0);

      cwd = path.resolve(repoDir, command.replace('cd ', ''));
    });

    test('install dependencies', async () => {
      const textElements = await page.$$('//*[@id="install-dependencies"]/div[2]/div/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, cwd);
      expect(code).toBe(0);
    });

    test('set capabilities', async () => {
      const textElements = await page.$$('//*[@id="set-capabilities"]/div[2]/div/pre/code/span');
      const config = await concatText(textElements);
      const parse = (): unknown | null => {
        try {
          JSON5.parse(config);
          return null;
        } catch (error) {
          console.error('config parse error:', error);
          return error;
        }
      };
      expect(parse()).toBeNull();
      await fs.promises.writeFile(path.resolve(cwd, doguConfigJsonFileName), config);
    });

    test('run test', async () => {
      test.setTimeout(60_000);
      const textElements = await page.$$('//*[@id="run-test"]/div[2]/div/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, cwd);
      expect(code).toBe(0);
    });
  });
}

if (doJestMacosWeb) {
  test.describe('test jest macos web', () => {
    let cwd = '';

    test('change jest macos web', async () => {
      await page.click('//*[@id="target-selector"]/../../span/div');
      await page.click('//*[@id="target-selector_list_0"]');

      await page.click('//*[@id="platform-selector"]/../../span/div');
      await page.click('//*[@id="platform-selector_list_3"]');

      await expect(page.locator('//*[@id="framework-selector"]/../../*[contains(.,"Jest")]')).toBeVisible();
      await expect(page.locator('//*[@id="platform-selector"]/../../*[contains(.,"macOS")]')).toBeVisible();
      await expect(page.locator('//*[@id="target-selector"]/../../*[contains(.,"Web")]')).toBeVisible();
    });

    test('change directory', async () => {
      const textElements = await page.$$('//*[@id="project-setup"]/div[2]/div[2]/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, repoDir);
      expect(code).toBe(0);

      cwd = path.resolve(repoDir, command.replace('cd ', ''));
    });

    test('install dependencies', async () => {
      const textElements = await page.$$('//*[@id="install-dependencies"]/div[2]/div/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, cwd);
      expect(code).toBe(0);
    });

    test('set capabilities', async () => {
      const textElements = await page.$$('//*[@id="set-capabilities"]/div[2]/div/pre/code/span');
      const config = await concatText(textElements);
      const parse = (): unknown | null => {
        try {
          JSON5.parse(config);
          return null;
        } catch (error) {
          console.error('config parse error:', error);
          return error;
        }
      };
      expect(parse()).toBeNull();
      await fs.promises.writeFile(path.resolve(cwd, doguConfigJsonFileName), config);
    });

    test('run test', async () => {
      test.setTimeout(60_000);
      const textElements = await page.$$('//*[@id="run-test"]/div[2]/div/pre/code/span');
      const command = await concatText(textElements);
      const code = await spawnAndWait(command, cwd);
      expect(code).toBe(0);
    });
  });
}
