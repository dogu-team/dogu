import { loadEnvLazySync } from '@dogu-private/env-tools';
import { afterAll, beforeAll, Dest, job, test } from '@dogu-tech/dest';
import dotenv from 'dotenv';
import path from 'path';

import { Driver } from '../../src/chromedriver';
import { E2eEnv } from '../../src/env';
import { ProcessManager } from '../../src/process-manager';
import { Timer } from '../../src/timer';
import { Utils } from '../../src/utils';
import { currentL10n, l10n } from './bat/l10n';
import { startDost } from './bat/workspace';

const env = loadEnvLazySync(E2eEnv);

dotenv.config({ path: path.join(__dirname, '.env') });

const randomId = Utils.random();
const randomInvitationId = Utils.random();

const values = {
  value: {
    HOME_URL: '',
    USER_NAME: 'test',
    USER_EMAIL: `test${randomId}@dogutech.io`,
    INVITE_USER_NAME: 'test_invitation',
    INVITE_USER_EMAIL: `test${randomInvitationId}@dogutech.io`,
    ORG_NAME: `Test Org`,
    PROJECT_NAME: 'Test Project',
    TEAM_NAME: `test team ${randomId}`,
    HOST_NAME: `test host ${randomId}`,
    HOST_DEVICE_TAG: `test-host-tag`,
    ANDROID_DEVICE_TAG: `test-android-tag`,
    IOS_DEVICE_TAG: `test-ios-tag`,
    ROUTINE_NAME: 'e2e',
    SAMPLE_PROJECT_NAME: 'sample project',
    SAMPLE_ROUTINE_NAME: 'sample routine',
    SAMPLE_APP_EXTENSION: 'APK',
  },
};

const routineYamlContent = `name: e2e

on:
  workflow_dispatch:

jobs:
  test-group:
    runs-on:
      group: ${values.value.ANDROID_DEVICE_TAG}
    steps:
      - name: test runs-on.group
        run: echo test run...
  test-landing-external-links:
    runs-on: ${values.value.HOST_DEVICE_TAG}
    steps:
      - name: test landing external links
        run: cd samples/pytest-bdd-playwright-dogu-report && yarn test:python`;

const waitUntilModalClosed = async (): Promise<void> => {
  for (let i = 0; i < 10; i++) {
    const modals = await Driver.findElements({ xpath: '//*[contains(@class, "ant-modal-wrap")]' }, { waitTime: 1000 });

    if (modals && modals.length > 0) {
      const isClosed = modals.every((item) => item.getAttribute('style').then((style) => style.includes('display: none')));
      if (!isClosed) {
        await Timer.wait(1000, 'wait until modal closed');
      } else {
        break;
      }
    }

    break;
  }
};

Dest.withOptions({
  timeout: 60 * 60 * 1000,
}).describe(() => {
  job('BAT', () => {
    beforeAll(async () => {
      values.value.HOME_URL = `http://${env.DOGU_E2E_HOST}:${env.DOGU_CONSOLE_WEB_FRONT_PORT}`;
      console.log(`DeviceServerPort ${env.DOGU_DEVICE_SERVER_PORT}`);
    });

    test('Print env', () => {
      console.log('env', process.env);
    });

    const { dost } = startDost();

    job('Launch browser', () => {
      test('Launch browser', () => {
        Driver.open({ l10n: currentL10n });
      });
    });

    job('Sign up', () => {
      test('Go to main page', async () => {
        await Driver.moveTo(values.value.HOME_URL);
      });

      // Move to signup page due to landing page has no sign up button
      test('Move to sign up', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="sign-up-btn"]' });
      });

      test('Make Invitatin user', async () => {
        const firstClickOptions = {
          focusWindow: true,
        };

        await Driver.sendKeys({ xpath: '//*[@access-id="sign-up-form-user-name"]' }, values.value.INVITE_USER_NAME, firstClickOptions);
        await Driver.sendKeys({ xpath: '//*[@access-id="sign-up-form-email"]' }, values.value.INVITE_USER_EMAIL);
        await Driver.sendKeys({ xpath: '//*[@access-id="sign-up-form-pw"]' }, 'qwer1234!');

        await Driver.clickElement(
          {
            xpath: '//*[@access-id="sign-up-form-submit"]',
          },
          {
            focusWindow: true,
          },
        );

        await Driver.clickElement(
          {
            xpath: '/html/body/div[1]/div/header/div/div/div[2]/div[1]/div/span',
          },
          {
            focusWindow: true,
          },
        );

        await Driver.clickElement(
          {
            xpath: `//span[text()="${l10n('SIGNOUT')}"]/..`,
          },
          {
            focusWindow: true,
          },
        );
      });
    });

    job('Sign up', () => {
      test('Go to main page', async () => {
        await Driver.moveTo(values.value.HOME_URL);
      });

      // Move to signup page due to landing page has no sign up button
      test('Move to sign up', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="sign-up-btn"]' });
      });

      test('Sign up', async () => {
        const firstClickOptions = {
          focusWindow: true,
        };

        await Driver.sendKeys({ xpath: '//*[@access-id="sign-up-form-user-name"]' }, values.value.USER_NAME, firstClickOptions);
        await Driver.sendKeys({ xpath: '//*[@access-id="sign-up-form-email"]' }, values.value.USER_EMAIL);
        await Driver.sendKeys({ xpath: '//*[@access-id="sign-up-form-pw"]' }, 'qwer1234!');

        await Driver.clickElement(
          {
            xpath: '//*[@access-id="sign-up-form-submit"]',
          },
          {
            focusWindow: true,
          },
        );
      });
      dost.nextTest();
    });
    afterAll(async () => {
      Timer.close();

      await Driver.close();
      ProcessManager.close();
    });
  });
});
