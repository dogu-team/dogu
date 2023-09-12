import { loadEnvLazySync } from '@dogu-private/env-tools';
import { afterAll, beforeAll, Dest, expect, job, test } from '@dogu-tech/dest';
import dotenv from 'dotenv';
import path from 'path';

import { E2eEnv } from '../../src/env';
import { Driver } from '../../src/playwright-driver';
import { ProcessManager } from '../../src/process-manager';
import { Timer } from '../../src/timer';
import { Utils } from '../../src/utils';
import { runHost } from './bat/host';
import { currentL10n, l10n } from './bat/l10n';
import testRemote from './bat/remote-test';
import { startConsoleAndDost } from './bat/workspace';

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
    SAMPLE_PROJECT_NAME: 'Sample project',
    SAMPLE_ROUTINE_NAME: 'sample routine',
    SAMPLE_APP_EXTENSION: 'APK',
    SAMPLE_APP_PATH: path.resolve('samples/dogurpgsample.apk'),
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

Dest.withOptions({
  timeout: 60 * 60 * 1000,
}).describe(() => {
  job('BAT', () => {
    beforeAll(async () => {
      values.value.HOME_URL = `http://${env.DOGU_E2E_HOST}:${env.DOGU_CONSOLE_WEB_FRONT_PORT}`;
      await ProcessManager.killByPorts([env.DOGU_CONSOLE_WEB_FRONT_PORT, env.DOGU_CONSOLE_WEB_SERVER_PORT, env.DOGU_E2E_DEVICE_SERVER_PORT]);
      await ProcessManager.killByNames(['adb']);
    });

    afterAll(async () => {
      Timer.close();
      await Driver.close();
      await Driver.closeBrowser();
      ProcessManager.close();
    });

    test('Print env', () => {
      console.log('env', process.env);
    });

    const { dost } = startConsoleAndDost(env.DOGU_CONSOLE_WEB_FRONT_PORT);

    job('Launch browser', () => {
      test('Launch browser', async () => {
        await Driver.open({ l10n: currentL10n });
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

      test('Make invitee user', async () => {
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

      test('Skip tutorial', async () => {
        await Driver.clickElement({ xpath: '//button[@id="skip-tutorial"]' });
      });
    });

    job('Organization settings', () => {
      test('Click settings button', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-setting"]' });
      });

      test('Rename organization', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.USER_NAME}'s organization"]` }, '1234');
        await Driver.clickElement({ xpath: '//button[@access-id="submit-org-profile-btn"]' });
        await Timer.wait(5000, 'wait for changing organization name');
        const value = await Driver.getText({ xpath: '//p[@access-id="sb-title"]' });
        expect(value).toBe(`${`${values.value.USER_NAME}'s organization`}1234`);
      });

      test('Show access token', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="show-access-token-btn"]' });
        await Driver.findElement({ xpath: '//input[@access-id="copy-token-input" and contains(@value, "dogu-org-token")]' });
      });

      test('Revoke access token', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="regen-token-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="regen-token-confirm-btn"]' });
        await Driver.findElement({ xpath: '//div[@access-id="regen-token-success"]' });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      });

      // test('Delete organization', async () => {
      //   await Driver.clickElement({ xpath: '//button[@access-id="remove-org-btn"]' });
      //   await Driver.clickElement({ xpath: '//button[@id="remove-org-confirm-btn"]' });
      //   await Driver.findElement({ xpath: '//*[contains(@class, "ant-empty")]' });
      // });
    });

    job('Account settings', () => {
      test('Move to account page', async () => {
        await Driver.clickElement(
          {
            xpath: '//*[@id="__next"]/div/header/div/div/div[2]/div[1]/div/span',
          },
          {
            focusWindow: true,
          },
        );
        await Driver.clickElement({ xpath: '//li[contains(@data-menu-id, "account")]' });
      });

      test('Rename username', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.USER_NAME}"]` }, '1');
        await Driver.clickElement({ xpath: '//button[@access-id="update-proifle-btn"]' });

        await Timer.wait(5000, 'wait for changing username');

        await Driver.clickElement(
          {
            xpath: '//*[@id="__next"]/div/header/div/div/div[2]/div[1]/div/span',
          },
          {
            focusWindow: true,
          },
        );
        const value = await Driver.getText({ xpath: '//*[@id="account-name"]' });
        expect(value).toBe(`${values.value.USER_NAME}1`);
      });

      test('Revert username', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.USER_NAME}1"]` }, `\b`);
        await Driver.clickElement({ xpath: '//button[@access-id="update-proifle-btn"]' });
      });

      test('Show access token', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="show-access-token-btn"]' });
        await Driver.findElement({ xpath: '//input[@access-id="copy-token-input" and contains(@value, "dogu-personal-token")]' });
      });

      test('Revoke access token', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="regen-token-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="regen-token-confirm-btn"]' });
        await Driver.findElement({ xpath: '//div[@access-id="regen-token-success"]' });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      });
    });

    job('Create new organization', () => {
      test('Move to my orgnaizations page', async () => {
        await Driver.clickElement(
          {
            xpath: '//*[@id="__next"]/div/header/div/div/div[2]/div[1]/div/span',
          },
          {
            focusWindow: true,
          },
        );

        await Driver.clickElement({
          xpath: `//div[text()="${l10n('ORGANIZATIONS')}"]`,
        });
      });

      test('Click create organization button', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="new-org-btn"]' }, { waitTime: 60 * 1000 });
      });

      test('Enter organization name', async () => {
        await Driver.sendKeys({ xpath: '//*[@id="name"]' }, values.value.ORG_NAME);
      });

      test('Click create organization button', async () => {
        await Driver.clickElement({ xpath: '//button[@form="new-org"]' }), { waitTime: 10 * 1000 };
      });

      test('Check organization creation', async () => {
        await Driver.findElement({ xpath: `//*[text()='${values.value.ORG_NAME}']` }, { waitTime: 20000 });
      });

      test('Go back', async () => {
        await Driver.goBack();
        await Driver.clickElement({ xpath: `//p[text()="${values.value.USER_NAME}'s organization1234"]` });
      });
    });

    job('Add member', () => {
      test('Go to member menu', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-member"]' }, { waitTime: 1 * 1000 });
      });

      test('Click member invite button ', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="invite-user-btn"]' }, { waitTime: 1 * 1000 });
      });

      test('Enter invite email', async () => {
        await Driver.sendKeys({ xpath: '//input[@access-id="invite-user-input"]' }, values.value.INVITE_USER_EMAIL);
        await Driver.clickElement({ xpath: '//button[@access-id="invite-user-add-email-btn"]' });
      });

      test('Selecte invite permission and send ', async () => {
        await Driver.clickElement({ xpath: '//*[@id="invite-user-send-btn"]' });
      });

      test('Go to member page', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="org-member-tab"]' });
        await Timer.wait(1000, 'wait for member update');
        await Driver.clickElement({ xpath: '//button[@access-id="refresh-btn"]' });
      });

      test('Check invite result', async () => {
        const invitedUserEmail = await Driver.getText({ xpath: `//*[text()="${values.value.INVITE_USER_NAME}"]` }, { focusWindow: true });
        expect(invitedUserEmail).toBe(values.value.INVITE_USER_NAME);
      });
    });

    job('Update member permission', () => {
      test('Click permission selector', async () => {
        await Driver.clickElement({ xpath: '//div[@class="ant-select-selector"]' });
      });

      test('Click admin permission', async () => {
        await Driver.clickElement({ xpath: '//div[text()="Admin"]' });
      });

      test('Check permission update', async () => {
        const value = await Driver.getText({ xpath: '//span[@class="ant-select-selection-item"]/div' });
        expect(value).toBe('Admin');
      });
    });

    job('Create sample project', () => {
      test('Go to projects page', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-project"]' });
      });

      test('Click create new project button', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="add-project-btn"]' });
      });

      test('Enter project info', async () => {
        await Driver.sendKeys({ xpath: '//*[@id="name"]' }, values.value.SAMPLE_PROJECT_NAME);
        await Driver.sendKeys({ xpath: '//*[@id="desc"]' }, 'Test Project Description');
      });

      test('Click create project button', async () => {
        await Driver.clickElement({ xpath: '//button[@form="new-project"]' });
      });

      test('Back to organizaiton page', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-back"]' });
      });
    });

    job('Create team', () => {
      test('Click team menu', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-team"]' });
      });

      test('Click create team', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="create-team-btn"]' });
      });

      test('Create new team', async () => {
        await Driver.sendKeys({ xpath: '//input[@id="name"]' }, values.value.TEAM_NAME);
        await Driver.clickElement({ xpath: '//button[@form="new-team"]' });
      });
    });

    job('Team setting', () => {
      test('Go to team page', async () => {
        const teamXPath = `//p[text()="${values.value.TEAM_NAME}"]`;
        const teamName = await Driver.getText({ xpath: teamXPath });
        expect(teamName).toBe(values.value.TEAM_NAME);

        await Driver.clickElement({ xpath: teamXPath });
      });

      test('Add team member', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="add-team-member-btn"]' });
        await Driver.sendKeys({ xpath: '//input[@access-id="add-team-member-input"]' }, values.value.INVITE_USER_EMAIL);
        await Driver.clickElement({ xpath: '//*[@aria-label="plus"]/..' });

        const [userName, userEmail] = await Promise.all([
          Driver.getText({ xpath: `//*[text()="${values.value.INVITE_USER_NAME}"]` }),
          Driver.getText({ xpath: `//*[text()="${values.value.INVITE_USER_EMAIL}"]` }),
        ]);
        expect(userName).toBe(values.value.INVITE_USER_NAME);
        expect(userEmail).toBe(values.value.INVITE_USER_EMAIL);
      });

      test('Click projects tab', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="team-project-tab"]' });
      });

      test('Add project to team', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="add-project-to-team-btn"]' });
        await Driver.sendKeys({ xpath: '//input[@access-id="add-project-modal-input"]' }, values.value.SAMPLE_PROJECT_NAME);
        await Driver.clickElement({ xpath: `//div[contains(text(), "${values.value.SAMPLE_PROJECT_NAME}")]` });
        await Driver.clickElement({ xpath: '//button[@access-id="permission-select-submit-button"]' });
        await Driver.findElement({ xpath: `//p[text()="${values.value.SAMPLE_PROJECT_NAME}"]` });
      });

      test('Click settings tab', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="team-setting-tab"]' });
      });

      test('Edit team name', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.TEAM_NAME}"]` }, '1');
        await Driver.clickElement({ xpath: '//button[@access-id="update-team-profile-btn"]' });
        await Timer.wait(1000, 'wait for changing team name');
        const value = await Driver.getText({ xpath: '//*[@id="__next"]/div/section/main/div/div[1]/h4' });
        const endsWith = value.endsWith(`${values.value.TEAM_NAME}1`);
        expect(endsWith).toBe(true);
      });

      test('Revert team name', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.TEAM_NAME}1"]` }, '\b');
        await Driver.clickElement({ xpath: '//button[@access-id="update-team-profile-btn"]' });
        await Timer.wait(1000, 'wait for changing team name');
        const value = await Driver.getText({ xpath: '//*[@id="__next"]/div/section/main/div/div[1]/h4' });
        const endsWith = value.endsWith(`${values.value.TEAM_NAME}`);
        expect(endsWith).toBe(true);
      });
    });

    job('Create project', () => {
      test('Go to projects page', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-project"]' });
      });

      test('Click create new project button', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="add-project-btn"]' });
      });

      test('Enter project info', async () => {
        await Driver.clickElement({ xpath: '//input[@type="radio" and @value="2"]/../..' });
        await Driver.sendKeys({ xpath: '//*[@id="name"]' }, values.value.PROJECT_NAME);
        await Driver.sendKeys({ xpath: '//*[@id="desc"]' }, 'Test Project Description');
      });

      test('Click create project button', async () => {
        await Driver.clickElement({ xpath: '//button[@form="new-project"]' });
      });

      test('Check project creation', async () => {
        const createdProjectName = await Driver.getText({ xpath: '//p[@access-id="sb-title"]' });
        expect(createdProjectName).toBe(values.value.PROJECT_NAME);
      });
    });

    job('Project application upload', () => {
      test('Click app tab', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-apps"]' });
      });

      test('Click upload button', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="project-app-upload-btn"]' });
      });

      test('Upload sample app', async () => {
        await Driver.uploadFile({ xpath: '//input[@id="project-app-uploader"]' }, values.value.SAMPLE_APP_PATH);
        await Timer.wait(1000, 'wait for app upload');
        await Driver.clickElement({ xpath: '//button[@access-id="project-app-upload-modal-ok-btn"]' });
        await Timer.wait(10000, 'wait for app upload');
      });

      test('Check app uploaded', async () => {
        await Driver.findElement({ xpath: '//*[@access-id="list-menu-btn"]' });
      });
    });

    job('Project member', () => {
      test('Click member tab', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-members"]' });
      });

      test('Add organization member with admin permission', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="add-project-org-member-btn"]' });
        await Driver.sendKeys({ xpath: '//input[@access-id="add-project-member-input"]' }, values.value.INVITE_USER_EMAIL);
        await Driver.clickElement({ xpath: '//div[@id="permission-select-result-container"]/button' });
        await Driver.clickElement({ xpath: '//button[@access-id="permission-select-submit-button"]' });
      });

      test('Check organization member added', async () => {
        const userName = await Driver.getText({ xpath: `//div[text()="${l10n('PROJECT_ORG_MEMBER_TYPE')}"]/../div[1]/div/div` });
        expect(userName).toBe(values.value.INVITE_USER_NAME);
      });

      test('Change permission', async () => {
        await Driver.clickElement({ xpath: `//div[text()="${l10n('PROJECT_ORG_MEMBER_TYPE')}"]/../div[3]/div/div/span[2]` });
        await Driver.clickElement({ xpath: '//div[@title="Write"]' });
        await Timer.wait(1500, 'wait for changing permission');
        const permission = await Driver.getText({ xpath: `//div[text()="${l10n('PROJECT_ORG_MEMBER_TYPE')}"]/..//span[@class="ant-select-selection-item"]` });
        expect(permission).toBe('Write');
      });

      test('Add team with read permission', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="add-project-team-btn"]' });
        await Driver.sendKeys({ xpath: '//input[@access-id="add-project-team-input"]' }, values.value.TEAM_NAME);
        await Driver.clickElement({ xpath: '//div[@id="permission-select-result-container"]/button' });
        await Driver.clickElement({ xpath: '//input[@value="3"]/../..' });
        await Driver.clickElement({ xpath: '//button[@access-id="permission-select-submit-button"]' });
      });

      test('Check team added', async () => {
        const teamName = await Driver.getText({ xpath: `//div[text()="${l10n('PROJECT_TEAM_MEMBER_TYPE')}"]/../div[1]/a` });
        expect(teamName).toBe(values.value.TEAM_NAME);
        const permission = await Driver.getText({ xpath: `//div[text()="${l10n('PROJECT_TEAM_MEMBER_TYPE')}"]/../div[3]/div/div/span[2]` });
        expect(permission).toBe('Read');
      });

      test('Remove project members', async () => {
        await Driver.clickElement({ xpath: `//div[text()="${l10n('PROJECT_ORG_MEMBER_TYPE')}"]/../div[4]/div/div/button` });
        await Driver.clickElement({ xpath: '//button[@id="remove-member-menu-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="remove-member-confirm-btn"]' });
        await Driver.clickElement({ xpath: `//div[text()="${l10n('PROJECT_TEAM_MEMBER_TYPE')}"]/../div[4]/div/div/button` });
        await Driver.clickElement({ xpath: '//button[@id="remove-member-menu-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="remove-member-confirm-btn"]' });
        await Driver.findElement({ xpath: '//*[contains(@class, "ant-empty")]' });
      });
    });

    job('Project settings', () => {
      test('Click settings tab', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-settings"]' });
      });

      test('Rename project', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.PROJECT_NAME}"]` }, '1');
        await Driver.clickElement({ xpath: '//button[@access-id="update-project-profile-btn"]' });
        await Timer.wait(2000, 'wait for changing project name');
        const value = await Driver.getText({ xpath: '//p[@access-id="sb-title"]' });
        expect(value).toBe(`${values.value.PROJECT_NAME}1`);
      });

      test('Revert rename project', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.PROJECT_NAME}1"]` }, `\b`);
        await Driver.clickElement({ xpath: '//button[@access-id="update-project-profile-btn"]' });
      });

      test('Show access token', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="show-access-token-btn"]' });
        await Driver.findElement({ xpath: '//input[@access-id="copy-token-input" and contains(@value, "dogu-project-token")]' });
      });

      test('Revoke access token', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="regen-token-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="regen-token-confirm-btn"]' });
        await Driver.findElement({ xpath: '//div[@access-id="regen-token-success"]' });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      });

      test('Change project template', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="update-project-template-btn"]' });
        await Driver.clickElement({ xpath: '//input[@type="radio" and @value="0"]/../..' });
        await Driver.clickElement({ xpath: '//button[@id="update-project-template-confirm-btn"]' });
        await Timer.wait(2000, 'wait for changing project template');
        let element = await Driver.findElement({ xpath: '//div[@title="General" and @class="ant-menu-item-group-title"]/../ul/li[1]/span/a' });
        let accessId = await element.getAttribute('access-id');
        expect(accessId).toBe('project-side-bar-apps');

        await Driver.clickElement({ xpath: '//button[@access-id="update-project-template-btn"]' });
        await Driver.clickElement({ xpath: '//input[@type="radio" and @value="1"]/../..' });
        await Driver.clickElement({ xpath: '//button[@id="update-project-template-confirm-btn"]' });
        await Timer.wait(2000, 'wait for changing project template');
        element = await Driver.findElement({ xpath: '//div[@title="General" and @class="ant-menu-item-group-title"]/../ul/li[1]/span/a' });
        accessId = await element.getAttribute('access-id');
        expect(accessId).toBe('project-side-bar-members');

        await Driver.clickElement({ xpath: '//button[@access-id="update-project-template-btn"]' });
        await Driver.clickElement({ xpath: '//input[@type="radio" and @value="3"]/../..' });
        await Driver.clickElement({ xpath: '//button[@id="update-project-template-confirm-btn"]' });
        await Timer.wait(2000, 'wait for changing project template');
        element = await Driver.findElement({ xpath: '//div[@title="General" and @class="ant-menu-item-group-title"]/../ul/li[1]/span/a' });
        accessId = await element.getAttribute('access-id');
        expect(accessId).toBe('project-side-bar-apps');
      });
    });

    job('Host setting', () => {
      test('Go to organization page', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-back"]' });
      });

      test('Click device farm menu', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-device-farm"]' });
      });

      test('Create new host', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="add-new-host-btn"]' }, { focusWindow: true });
        await Driver.sendKeys({ xpath: '//*[@access-id="add-host-form-name"]' }, values.value.HOST_NAME, { focusWindow: true });
        await Driver.clickElement({ xpath: '//button[@form="new-host"]' }, { focusWindow: true });
        await Driver.findElement({ xpath: '//input[@access-id="copy-token-input"]' });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      });

      test('Check host', async () => {
        await Driver.clickElement({ xpath: `//span[text()="${values.value.HOST_NAME}"]` });
        const hostName = await Driver.getText({ xpath: '//p[@access-id="host-modal-name"]' });
        expect(hostName).toBe(values.value.HOST_NAME);

        const creatorName = await Driver.getText({ xpath: '//h4[@id="host-creator-title"]/../div/div' });
        expect(creatorName).toBe(values.value.USER_NAME);

        await Driver.clickElement({ xpath: '//button[@access-id="show-host-token-btn"]' });
        await Driver.findElement({ xpath: '//input[contains(@value, "dogu-agent-token")]' });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      });

      test('Edit host', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="list-menu-btn"]' });
        await Driver.clickElement({ xpath: '//li[contains(@data-menu-id, "edit")]/span/button' });
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.HOST_NAME}"]` }, '1');
        await Driver.clickElement({ xpath: '//button[@accesskey="save-host-edit-modal"]' });
        await Timer.wait(1000, 'wait for changing host name');
        await Driver.findElement({ xpath: `//span[text()="${values.value.HOST_NAME}1"]` });
      });

      // FIX: checking revoked token not working
      // test('Revoke host token', async () => {
      //   await Driver.clickElement({ xpath: '//button[@access-id="list-menu-btn"]' });
      //   await Driver.clickElement({ xpath: '//li[contains(@data-menu-id, "token")]/span/button' });
      //   await Driver.clickElement({ xpath: '//button[@id="host-token-revoke-confirm-btn"]' });
      //   // await Timer.wait(2000, 'wait for modal update');
      //   await Driver.findElement({ xpath: '//div[@access-id="host-token-revoke-alert"]' });
      //   await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      // });

      test('Delete host', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="list-menu-btn"]' });
        await Driver.clickElement({ xpath: '//li[contains(@data-menu-id, "delete")]/span/button' });
        await Driver.clickElement({ xpath: '//button[@id="host-delete-confirm-btn"]' });
        await Driver.findElement({ xpath: '//*[contains(@class, "ant-empty")]' });
      });

      dost.nextTest();
    });

    runHost(values.value.HOST_NAME, dost);

    const deviceSettingInfos = [
      {
        settingJobName: 'Host device setting',
        studioJobName: "Host device's studio",
        addTabMenu: '//span[text()="Host"]/../../../div[5]//button[@access-id="list-menu-btn"]',
        listTabMenu: '//span[text()="Host"]/../../../../div[5]//button[@access-id="list-menu-btn"]',
        studio: '//span[text()="Host"]/../../../..//a[@target="_blank"]',
        tag: values.value.HOST_DEVICE_TAG,
        isHost: true,
      },
      {
        settingJobName: 'Android device setting',
        studioJobName: "Android device's studio",
        addTabMenu: '//*[@icon-id="android-icon"]/../../../div[5]//button[@access-id="list-menu-btn"]',
        listTabMenu: '//*[@icon-id="android-icon"]/../../../div[5]//button[@access-id="list-menu-btn"]',
        studio: '//*[@icon-id="android-icon"]/../../../..//a[@target="_blank"]',
        tag: values.value.ANDROID_DEVICE_TAG,
        isHost: false,
      },
    ];
    let hostDeviceName = '';
    let androidDeviceName = '';
    // if (process.platform === 'darwin') {
    //   deviceSettingInfos.push({
    //     name: 'iOS device setting',
    //     addTabMenu: '//*[@data-icon="apple"]/../../../../div[5]/div/div/button',
    //     listTabMenu: '//*[@data-icon="apple"]/../../../../div[5]/div/div[2]/button',
    //     tag: values.value.IOS_DEVICE_TAG,
    //     isHost: false,
    //   });
    // }

    deviceSettingInfos.forEach((deviceSettingInfo) => {
      const { settingJobName, addTabMenu, listTabMenu, tag, isHost } = deviceSettingInfo;

      job(settingJobName, () => {
        job('Add device', () => {
          test('Click on add tab', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="side-bar-device-farm"]' });
            await Driver.clickElement({ xpath: '//*[@access-id="org-add-device-tab"]' });
          });

          test('Click menu', async () => {
            await Driver.clickElement({ xpath: addTabMenu });
          });

          test('Click to use', async () => {
            await Driver.clickElement({ xpath: `//*[text()="${l10n('START_USING')}"]` });
          });

          test('Insert project name', async () => {
            await Timer.wait(1000, 'wait for input focus');
            await Driver.sendKeys({ xpath: `//input[@placeholder="${l10n('NAME')}"]` }, values.value.PROJECT_NAME, { focusWindow: true });
          });

          test('Click project on extended list', async () => {
            await Timer.wait(3000, 'wait for modal update');
            await Driver.clickElement({ xpath: `//*[text()="${values.value.PROJECT_NAME}"]` }, { focusWindow: true });
          });

          test('Close modal', async () => {
            await Timer.wait(3000, 'wait for modal update');
            const buttonXPath = '//button[@class="ant-modal-close"]';
            await Driver.findElement({ xpath: buttonXPath }, { focusWindow: true })
              .then(async () => {
                await Driver.clickElement({ xpath: buttonXPath }, { focusWindow: true }).catch(() => {
                  // do nothing
                });
              })
              .catch(() => {
                // do nothing
              });
          });
        });

        job('Add tag', () => {
          test('Click tag tab', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="org-tag-list-tab"]' });
          });

          test('Click add tag', async () => {
            await Driver.clickElement({ xpath: '/html/body/div/div/section/main/div/div[2]/div[2]/div/div[1]/div/div/button' }, { focusWindow: true });
          });

          test('Enter tag', async () => {
            await Timer.wait(1000, 'wait for input focus');
            await Driver.sendKeys({ xpath: `//input[@id="name"]` }, tag, { focusWindow: true });
          });

          test('Click create tag button', async () => {
            await Driver.clickElement({ xpath: '//button[@form="new-tag"]' });
          });

          test('Create tag check', async () => {
            await Driver.waitTextElement(tag);
          });
        });

        job('Add tag to device', () => {
          test('Add list tab', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="org-device-list-tab"]' });
            if (isHost) {
              hostDeviceName = await Driver.getText({ xpath: '//span[text()="Host"]/../../p' });
            } else {
              androidDeviceName = await Driver.getText({ xpath: '//*[@icon-id="android-icon"]/../../../div[1]/button/p' });
            }
          });

          test('Click menu', async () => {
            await Driver.clickElement(
              { xpath: listTabMenu },
              {
                focusWindow: true,
              },
            );
          });

          test('Click change tag', async () => {
            await Driver.clickElement({ xpath: `//*[text()="${l10n('EDIT_TAGS')}"]` });
          });

          test('Enter tag', async () => {
            await Timer.wait(1000, 'wait for input focus');
            await Driver.sendKeys({ xpath: '//input[@access-id="device-edit-tag-search-input"]' }, tag, { focusWindow: true });
          });

          test('Click tag', async () => {
            await Driver.clickElement({ xpath: '//*[@id="tag-result-box"]/button' });
          });

          test('Close tag change window', async () => {
            await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
          });
        });
      });
    });

    job('Project studio', () => {
      test('Move to project devices', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-project"]' });
        await Driver.clickElement({ xpath: `//a[text()="${values.value.PROJECT_NAME}"]` });
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-devices"]' });
      });

      deviceSettingInfos.forEach((deviceSettingInfo) => {
        const { studioJobName, studio, isHost } = deviceSettingInfo;

        job(studioJobName, () => {
          test('Click studio button', async () => {
            await Driver.clickElement({ xpath: studio });
            await Driver.switchTab(1);
          });

          test('Check streaming start', async () => {
            const status = await Driver.getText(
              {
                xpath: `//*[text()="${l10n('INFORMATION')}"]`,
              },
              {
                focusWindow: true,
              },
            );
            expect(status).toBe(l10n('INFORMATION'));
          });

          test('Check streaming input', async () => {
            const xpath = isHost ? '//*[@alt="volume down"]/..' : '//*[@data-icon="home"]/../..';
            await Driver.clickElement({ xpath });
            await Timer.wait(5000, 'wait for input processing');
            const logs = await Driver.logs();
            const pattern = isHost ? /.*e2e.*DEVICE_CONTROL_KEYCODE_VOLUME_DOWN.*(request|success).*/ : /.*e2e.*DEVICE_CONTROL_KEYCODE_HOME.*(request|success).*/;
            const hasLog = logs.filter((log) => log.message.match(pattern)).length >= 2;
            expect(hasLog).toBe(true);
          });
        });

        if (!isHost) {
          job('Native inspector', () => {
            test('Click inspector tab menu', async () => {
              await Driver.clickElement({ xpath: '//div[@data-node-key="inspector"]' });
              await Timer.wait(3000, 'wait for inspector update');
            });

            test('Select NATIVE_APP context', async () => {
              await Driver.clickElement({ xpath: '//div[@access-id="context-select"]' });
              await Driver.clickElement({ xpath: '//div[text()="NATIVE_APP"]' });
            });

            test('Expect tree node', async () => {
              const elements = await Driver.findElements({ xpath: '//div[contains(@class, "ant-tree-treenode-switcher")]' });
              expect(elements.length).toBe(1);
            });
          });

          job('Install app and check profile', () => {
            test('Click install tab menu', async () => {
              await Driver.clickElement({ xpath: '//div[@data-node-key="install"]' });
            });

            test('Enable open option', async () => {
              await Driver.clickElement({ xpath: '//button[@role="switch"]' });
            });

            test('Upload DoguRPGSample.apk', async () => {
              await Driver.uploadFile({ xpath: '//input[@type="file"]' }, values.value.SAMPLE_APP_PATH);
            });

            test('Check app name', async () => {
              await Driver.findElement({ xpath: '//*[text()="dogurpgsample.apk"]' });
            });

            test('Wait for install', async () => {
              await Timer.wait(30000, 'wait for install');
            });
          });

          job('Check device profile', () => {
            test('Click profile tab menu', async () => {
              await Driver.clickElement({ xpath: '//div[@data-node-key="profile"]' });
            });

            test('Check current process', async () => {
              await Driver.findElement({ xpath: '//*[text()="com.dogutech.DoguRpgSample"]' });
            });
          });

          job('Gamium inspector', () => {
            test('Click inspector tab menu', async () => {
              await Timer.wait(5000, 'wait for game loading');
              await Driver.clickElement({ xpath: '//div[@data-node-key="inspector"]' });
            });

            test('Click reconnect button', async () => {
              await Driver.clickElement({ xpath: '//*[@data-icon="disconnect"]/../..' });
              await Driver.clickElement({ xpath: '//*[@data-icon="reload"]/../..' });
              await Timer.wait(3000, 'wait for reconnect');
            });

            test('Select GAMIUM context', async () => {
              await Driver.clickElement({ xpath: '//div[@access-id="context-select"]' });
              await Driver.clickElement({ xpath: '//div[text()="GAMIUM"]' });
            });

            test('Expect tree node', async () => {
              const elements = await Driver.findElements({ xpath: '//div[contains(@class, "ant-tree-treenode-switcher")]' });
              expect(elements.length).toBe(1);
            });

            test('Click Home key', async () => {
              await Driver.clickElement({ xpath: '//*[@data-icon="home"]/../..' });
            });
          });

          job('Check logs', () => {
            test('Click log tab menu', async () => {
              await Driver.clickElement({ xpath: '//div[@data-node-key="logs"]' });
            });

            test('Set filter string', async () => {
              await Driver.sendKeys({ xpath: '//input[@access-id="device-log-filter-input"]' }, 't');
              await Driver.clickElement({ xpath: '//button[@access-id="log-filter-set-btn"]' });
            });

            test('Start log streaming', async () => {
              await Driver.clickElement({ xpath: '//button[@access-id="toggle-log-btn"]' });
              await Timer.wait(8000, 'wait for logs');
            });

            test('Check log streaming', async () => {
              // await Driver.scrollToBottom();
              await Driver.findElement({ xpath: '//b[text()="1"]' });
            });
          });
        }

        test('Close tab', async () => {
          await Driver.close();
          await Driver.switchTab(0);
        });
      });
    });

    job('Device management', () => {
      test('Move to organization device list', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-back"]' });
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-device-farm"]' });
        await Driver.clickElement({ xpath: '//*[@access-id="org-device-list-tab"]' });
      });

      const hostDeviceSettingConfig = deviceSettingInfos.find((item) => item.settingJobName === 'Host device setting');
      const androidDeviceSettingConfig = deviceSettingInfos.find((item) => item.settingJobName === 'Android device setting');

      test('Update device settings', async () => {
        expect(!!hostDeviceSettingConfig).toBe(true);
        await Driver.clickElement({ xpath: hostDeviceSettingConfig!.listTabMenu });
        await Driver.clickElement({ xpath: `//button[@id="${hostDeviceName}-setting-menu-btn"]` });
        await Driver.sendKeys({ xpath: '//input[@id="name"]' }, 'edit');
        await Driver.sendKeys({ xpath: '//input[@id="max"]' }, '\b8');
        await Driver.clickElement({ xpath: '//button[@id="save-device-setting-btn"]' });
        await Timer.wait(2000, 'wait for changing device setting');
        hostDeviceName += 'edit';
      });

      test('Check device name', async () => {
        await Driver.findElement({ xpath: '//span[text()="Host"]/../../p[contains(text(), "edit")]' });
        await Driver.clickElement({ xpath: hostDeviceSettingConfig!.listTabMenu });
        await Driver.clickElement({ xpath: `//button[@id="${hostDeviceName}-setting-menu-btn"]` });
        await Driver.findElement({ xpath: '//input[@id="max" and @value="8"]' });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      });

      test('Detach tag', async () => {
        await Driver.clickElement({ xpath: hostDeviceSettingConfig!.listTabMenu });
        await Driver.clickElement({ xpath: `//button[@id="${hostDeviceName}-edit-tag-menu-btn"]` });
        await Driver.clickElement({ xpath: '//p[@access-id="edit-tag-modal-title"]' });
        await Timer.wait(2000, 'wait for tag list show up');
        await Driver.clickElementLazy({ xpath: `//span[contains(@class, "ant-tag") and text()="${values.value.HOST_DEVICE_TAG}"]/span` }, {}, { force: true });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
        await Timer.wait(2000, 'wait for changing device tag');
        const tagCount = await Driver.getText({ xpath: '//span[text()="Host"]/../../../../div[5]/div[1]/div[1]/button/p' });
        expect(tagCount).toBe('1');
      });

      test('Use global', async () => {
        await Driver.clickElement({ xpath: hostDeviceSettingConfig!.listTabMenu });
        await Driver.clickElement({ xpath: `//button[@id="${hostDeviceName}-edit-project-menu-btn"]` });
        await Driver.clickElement({ xpath: '//input[@id="use-as-public-device-checkbox"]/../..' });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
        await Driver.findElement({ xpath: '//span[text()="Host"]/../..//span[text()="Public"]' });
      });

      test('Check global device', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-project"]' });
        await Driver.clickElement({ xpath: `//a[text()="${values.value.SAMPLE_PROJECT_NAME}"]` });
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-devices"]' });
        await Driver.findElement({ xpath: '//span[text()="Public"]' });
        await Driver.findElement({ xpath: '//span[text()="Host"]' });
      });

      test('Disable device', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="project-side-bar-back"]' });
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-device-farm"]' });
        await Driver.clickElement({ xpath: '//a[@access-id="org-device-list-tab"]' });
        await Driver.clickElement({ xpath: hostDeviceSettingConfig!.listTabMenu });
        await Driver.clickElement({ xpath: `//button[@id="${hostDeviceName}-stop-using-device-menu-btn"]` });
        await Driver.clickElement({ xpath: '//button[@id="stop-using-device-confirm-btn"]' });
        await Timer.wait(2000, 'wait for changing device setting');
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-project"]' });
        await Driver.clickElement({ xpath: `//a[text()="${values.value.SAMPLE_PROJECT_NAME}"]` });
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-devices"]' });
        await Driver.findElement({ xpath: '//*[contains(@class, "ant-empty")]' });
      });
    });

    job('Device tag management', () => {
      const androidDeviceSettingConfig = deviceSettingInfos.find((item) => item.settingJobName === 'Android device setting');

      test('Move to organization page', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-back"]' });
      });

      test('Move to device tag menu', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-device-farm"]' });
        await Driver.clickElement({ xpath: '//a[@access-id="org-tag-list-tab"]' });
      });

      test('Edit tag', async () => {
        await Driver.clickElement({ xpath: `//div[text()="${values.value.ANDROID_DEVICE_TAG}"]/../div[3]//button[@access-id="list-menu-btn"]` });
        await Driver.clickElement({ xpath: '//li[contains(@data-menu-id, "edit")]/span/button' });
        await Driver.sendKeys({ xpath: '//input[@id="name"]' }, 'edit');
        await Driver.clickElement({ xpath: '//button[@form="edit-device-tag"]' });
        await Timer.wait(2000, 'wait for changing device tag');
      });

      test('Edit tag check', async () => {
        await Driver.findElement({ xpath: `//div[text()="${values.value.ANDROID_DEVICE_TAG}edit"]` });
        await Driver.clickElement({ xpath: '//a[@access-id="org-device-list-tab"]' });
        await Driver.clickElement({ xpath: '//*[@icon-id="android-icon"]/../../../div[5]/div/div[1]/button' });
        await Driver.focusElement({ xpath: `//span[contains(@class, "ant-tag") and text()="${values.value.ANDROID_DEVICE_TAG}edit"]` });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      });

      test('Delete tag', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="org-tag-list-tab"]' });
        await Driver.clickElement({ xpath: `//div[text()="${values.value.ANDROID_DEVICE_TAG}edit"]/../div[3]//button[@access-id="list-menu-btn"]` });
        await Driver.clickElement({ xpath: '//li[contains(@data-menu-id, "delete")]/span/button' });
        await Driver.clickElement({ xpath: '//button[@id="tag-delete-confirm-btn"]' });
        await Timer.wait(2000, 'wait for deleting device tag');
      });

      test('Delete tag check', async () => {
        await Timer.wait(1000, 'wait for deleting device tag refresh');
        await Driver.clickElement({ xpath: '//a[@access-id="org-device-list-tab"]' });
        await Timer.wait(3000, 'wait for deleting device tag refresh');
        const tagCount = await Driver.getText({ xpath: '//*[@icon-id="android-icon"]/../../../div[5]/div/div[1]/button/p' });
        expect(tagCount).toBe('1');
      });
    });

    testRemote({
      consoleFrontDriver: Driver,
    });

    job('Deletion', () => {
      // project deletion
      test('Delete project', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-project"]' });
        await Driver.clickElement({ xpath: `//a[text()="${values.value.SAMPLE_PROJECT_NAME}"]` });
        await Driver.clickElement({ xpath: '//a[@access-id="project-side-bar-settings"]' });
        await Driver.clickElement({ xpath: '//button[@access-id="delete-project-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="delete-project-confirm-btn"]' });
      });

      test('Check project deletion', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="refresh-btn"]' });
        await Timer.wait(2000, 'wait for project deletion');
        const elems = await Driver.findElements({ xpath: '//div[@access-id="project-list"]//li[contains(@class, "ant-list-item")]' });
        expect(elems.length).toBe(1);
      });

      // team deletion
      test('Delete team', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-team"]' });
        await Driver.clickElement({ xpath: `//p[text()="${values.value.TEAM_NAME}"]/..` });
        await Driver.clickElement({ xpath: '//a[@access-id="team-setting-tab"]' });
        await Driver.clickElement({ xpath: '//button[@access-id="remove-team-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="remove-team-confirm-btn"]' });
      });

      test('Check team deletion', async () => {
        await Timer.wait(2000, 'wait for team deletion');
        await Driver.findElement({ xpath: '//*[contains(@class, "ant-empty")]' });
      });

      // member deletion
      test('Delete member', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-member"]' });
        await Driver.clickElement({ xpath: `//p[text()="${values.value.INVITE_USER_NAME}"]/../../../..//button[@access-id="list-menu-btn"]` });
        await Driver.clickElement({ xpath: '//li[contains(@data-menu-id, "delete")]/span/button' });
        await Driver.clickElement({ xpath: '//button[@id="remove-member-confirm-btn"]' });
      });

      test('Check member deletion', async () => {
        await Timer.wait(2000, 'wait for member deletion');
        const elems = await Driver.findElements({ xpath: '//button[@access-id="list-menu-btn"]' });
        expect(elems.length).toBe(1);
      });

      test('Delete org', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-setting"]' });
        await Driver.clickElement({ xpath: '//button[@access-id="remove-org-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="remove-org-confirm-btn"]' });
      });

      test('Check org deletion', async () => {
        await Timer.wait(2000, 'wait for org deletion');
        const elems = await Driver.findElements({ xpath: '//div[@access-id="organization-list"]//li[contains(@class, "ant-list-item")]' });
        expect(elems.length).toBe(1);
      });
    });
    job('Check log', () => {
      dost.checkLog();
    });
  });
});
