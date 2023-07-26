import { loadEnvLazySync } from '@dogu-private/env-tools';
import { afterAll, beforeAll, Dest, expect, job, test } from '@dogu-tech/dest';
import dotenv from 'dotenv';
import path from 'path';

import { Driver } from '../../src/chromedriver';
import { E2eEnv } from '../../src/env';
import { ProcessManager } from '../../src/process-manager';
import { Timer } from '../../src/timer';
import { Utils } from '../../src/utils';
import { runHost } from './bat/host';
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
    beforeAll(() => {
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
        await Driver.sendKeys({ xpath: '//input[@access-id="add-project-modal-input"]' }, 'Sample');
        await Driver.clickElement({ xpath: '//div[contains(text(), "Sample")]' });
        await Driver.clickElement({ xpath: '//button[@access-id="permission-select-submit-button"]' });
        await Driver.findElement({ xpath: '//p[text()="Sample Project"]' });
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

      test('Delete team', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="remove-team-btn"]' });
        await Driver.clickElement({ xpath: '//button[@id="remove-team-confirm-btn"]' });
        await Driver.findElement({ xpath: '//*[contains(@class, "ant-empty")]' });
      });
    });

    job('Organization settings', () => {
      test('Click settings button', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="side-bar-setting"]' });
      });

      test('Rename organization', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.USER_NAME}'s organization"]` }, '1234');
        await Driver.clickElement({ xpath: '//button[@access-id="submit-org-profile-btn"]' });
        const value = await Driver.getText({ xpath: '//p[@access-id="sb-title"]' });
        expect(value).toBe(`${`${values.value.USER_NAME}'s organization`.toUpperCase()}1234`);
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

        await Timer.wait(1000, 'wait for changing username');

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
        // const orgName = await Driver.getText({ xpath: '//*[@access-id="sb-title"]/div/div/p' });
        // /**
        //  * @note uppercase due to css property: text-transform
        //  */
        // expect(orgName).toBe(values.value.ORG_NAME.toUpperCase());

        await Driver.getText({ xpath: `//*[text()='${values.value.ORG_NAME}']` }, { waitTime: 20000 });
      });
    });

    job('Create project', () => {
      test('Click project menu', async () => {
        await Driver.clickElement(
          { xpath: '//*[@access-id="side-bar-project"]' },
          {
            focusWindow: true,
          },
        );
      });

      test('Click create new project button', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="add-project-btn"]' });
      });

      test('Enter project info', async () => {
        await Driver.sendKeys({ xpath: '//*[@id="name"]' }, values.value.PROJECT_NAME);
        await Driver.sendKeys({ xpath: '//*[@id="desc"]' }, 'Test Project Description');
      });

      test('Click create project button', async () => {
        await Driver.clickElement({ xpath: '//button[@form="new-project"]' });
      });

      test('Close project tutorial', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="skip-project-tutorial"]' });
      });

      test('Check project creation', async () => {
        const createdProjectName = await Driver.getText({ xpath: '//*[@access-id="project-layout-project-name"]' });
        expect(createdProjectName).toBe(values.value.PROJECT_NAME);
      });
    });

    job('Project application upload', () => {
      test('Click app tab', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-app-tab"]' });
      });

      test('Click upload button', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="project-app-upload-btn"]' });
      });

      test('Upload sample app', async () => {
        await Driver.uploadFile({ xpath: '//input[@id="project-app-uploader"]' }, values.value.SAMPLE_APP_PATH);
        await Timer.wait(10000, 'wait for app upload');
      });

      test('Check app uploaded', async () => {
        await Driver.findElement({ xpath: '//*[@access-id="list-menu-btn"]' });
      });
    });

    job('Project settings', () => {
      test('Click settings tab', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="project-setting-tab"]' });
      });

      test('Rename project', async () => {
        await Driver.sendKeys({ xpath: `//input[@value="${values.value.PROJECT_NAME}"]` }, '1');
        await Driver.clickElement({ xpath: '//button[@access-id="update-project-profile-btn"]' });
        await Timer.wait(1000, 'wait for changing project name');
        const value = await Driver.getText({ xpath: '//a[@access-id="project-layout-project-name"]/h4' });
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

      // test removing project after streaming
    });

    job('Host setting', () => {
      test('Go to organization page', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="project-layout-org-name"]' });
      });

      test('Click host menu', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-host"]' });
      });

      test('Create new host', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="add-new-host-btn"]' }, { focusWindow: true });
        await Driver.sendKeys({ xpath: '//*[@access-id="add-host-form-name"]' }, values.value.HOST_NAME, { focusWindow: true });
        await Driver.clickElement({ xpath: '//button[@form="new-host"]' }, { focusWindow: true });
        await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
      });

      test('Check host', async () => {
        await Driver.clickElement({ xpath: `//span[text()="${values.value.HOST_NAME}"]` });
        const hostName = await Driver.getText({ xpath: '//p[@access-id="host-modal-name"]' });
        expect(hostName).toBe(values.value.HOST_NAME);

        const creatorName = await Driver.getText({ xpath: '//h4[@id="host-creator-title"]/../div/div' });
        expect(creatorName).toBe(values.value.USER_NAME);

        await Driver.clickElement({ xpath: '//button[@access-id="show-host-token-btn"]' });
        await Driver.findElement({ xpath: '//*[contains(text(), "dogu-agent-token")]' });
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
        name: 'Host device setting',
        addTabMenu: '//*[text()="Host"]/../../../div[5]//button[@access-id="list-menu-btn"]',
        listTabMenu: '//*[text()="Host"]/../../../../div[5]//button[@access-id="list-menu-btn"]',
        tag: values.value.HOST_DEVICE_TAG,
        isHost: true,
      },
      {
        name: 'Android device setting',
        addTabMenu: '//*[@icon-id="android-icon"]/../../../div[5]//button[@access-id="list-menu-btn"]',
        listTabMenu: '//*[@icon-id="android-icon"]/../../../div[5]//button[@access-id="list-menu-btn"]',
        tag: values.value.ANDROID_DEVICE_TAG,
        isHost: false,
      },
    ];
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
      const { name, addTabMenu, listTabMenu, tag, isHost } = deviceSettingInfo;

      job(name, () => {
        job('Add device', () => {
          test('Go to device menu', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="side-bar-device"]' });
          });

          test('Click on add tab', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="org-add-device-tab"]' });
          });

          test('Click menu', async () => {
            await Driver.clickElement({ xpath: addTabMenu });
          });

          test('Click to use', async () => {
            await Driver.clickElement({ xpath: `//*[text()="${l10n('START_USING')}"]` });
          });

          test('Insert project name', async () => {
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
            await Timer.wait(3000, 'wait for tag tab');
            await Driver.clickElement({ xpath: '//*[@access-id="org-tag-list-tab"]' });
          });

          test('Click add tag', async () => {
            await Driver.clickElement({ xpath: '/html/body/div/div/section/main/div/div[2]/div[2]/div/div[1]/div/div/button' }, { focusWindow: true });
          });

          test('Enter tag', async () => {
            await Timer.wait(3000, 'wait for tag input');
            await Driver.sendKeys({ xpath: `//input[@id="name"]` }, tag, { focusWindow: true });
          });

          test('Click create tag button', async () => {
            await Driver.clickElement({ xpath: '//button[@form="new-tag"]' });
          });
        });

        job('Add tag to device', () => {
          test('Add list tab', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="org-device-list-tab"]' });
          });

          test('Click menu', async () => {
            await Driver.clickElement(
              { xpath: listTabMenu },
              {
                focusWindow: true,
              },
            );
          });

          test('Click chagne tag', async () => {
            await Driver.clickElement({ xpath: `//*[text()="${l10n('EDIT_TAGS')}"]` });
          });

          test('Enter tag', async () => {
            await Driver.sendKeys({ xpath: '//input[@access-id="device-edit-tag-search-input"]' }, tag);
          });

          test('Click tag', async () => {
            await Driver.clickElement({ xpath: '//*[@id="tag-result-box"]/button' });
          });

          test('Close tag change window', async () => {
            await Driver.clickElement({ xpath: '//button[@class="ant-modal-close"]' });
          });
        });

        job('Device streaming', () => {
          test('Go to device menu', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="side-bar-device"]' });
          });

          test('Click menu', async () => {
            await Driver.clickElement({ xpath: listTabMenu });
          });

          test('Click streaming button', async () => {
            await Driver.clickElement({ xpath: `//*[text()="${l10n('STREAMING')}"]` });
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

            test('Check app install end with profile', async () => {
              await Driver.findElement({ xpath: '//*[text()="com.dogutech.DoguRpgSample"]' }, { waitTime: 30 * 1000 });
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
              await Timer.wait(3000, 'wait for logs');
            });

            test('Check log streaming', async () => {
              await Driver.scrollToBottom();
              await Driver.findElement({ xpath: '//b[text()="1"]' });
            });
          });
        }
      });
    });

    afterAll(async () => {
      Timer.close();

      await Driver.close();
      ProcessManager.close();
    });
  });
});
