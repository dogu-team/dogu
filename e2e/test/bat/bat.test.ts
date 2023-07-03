import { loadEnvLazySync } from '@dogu-private/env-tools';
import { afterAll, beforeAll, Dest, expect, job, test } from '@dogu-tech/dest';
import dotenv from 'dotenv';
import path from 'path';
import { Key } from 'selenium-webdriver';

import { Driver } from '../../src/chromedriver';
import { E2eEnv } from '../../src/env';
import { GdcScreenRecorder } from '../../src/gdc-screen-recorder';
import { ProcessManager } from '../../src/process-manager';
import { Timer } from '../../src/timer';
import { Utils } from '../../src/utils';
import { runHost } from './bat/host';
import { currentL10n, l10n } from './bat/l10n';
import { startDost } from './bat/workspace';

const isCI = process.env.CI === 'true' || undefined !== process.env.GITHUB_ACTION;
const switchConfig = {
  prepareDB: isCI ? true : false,
};

const env = loadEnvLazySync(E2eEnv);

dotenv.config({ path: path.join(__dirname, '.env') });

const randomId = Utils.random();
const randomInvitationId = Utils.random();
let gdcRecorder: GdcScreenRecorder | null = null;
// let screenRecordStopper: ScreenRecordStopper | null = null;

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
        run: echo test run...`;

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
      values.value.HOME_URL = env.DOGU_CONSOLE_WEB_FRONT_URL;

      await ProcessManager.killByPorts([Number(env.DOGU_DEVICE_SERVER_PORT)]);

      await ProcessManager.killByNames(['IOSDeviceController', 'go-device-controller', 'host-agent']);

      // screenRecordStopper = await new ScreenRecorder().start({
      //   outputPath: path.resolve('generated', 'record', 'screen.webm'),
      // });
    });

    // if (switchConfig.prepareDB) {
    //   prepareDB();
    // }
    test('Run record', () => {
      gdcRecorder = new GdcScreenRecorder(console);
      gdcRecorder.start();
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
            xpath: '/html/body/div[3]/div/div/ul/li[5]/span/div/button',
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

        // There's no signup button in main page
        // sign-up
        // await Driver.clickElement(
        //   {
        //     xpath: '/html/body/div[1]/div/section/main/div/div[1]/div/div[1]/div[1]/button',
        //   },
        //   firstClickOptions,
        // );

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

    /**
     * @note When you sign up, you are automatically logged in
     */
    // job('Login', () => {
    //   test('Move to login', async () => {
    //     await Driver.moveTo(`${values.value.HOME_URL}/signin`);
    //   });

    //   test('Enter email', async () => {
    //     await Driver.sendKeys({ xpath: '/html/body/div[1]/div/div/div[1]/div[2]/div[2]/div[1]/form/div[1]/input' }, values.value.USER_EMAIL);
    //   });

    //   test('Enter password', async () => {
    //     await Driver.sendKeys({ xpath: '/html/body/div[1]/div/div/div[1]/div[2]/div[2]/div[1]/form/div[2]/span/input' }, 'qwer1234!');
    //   });

    //   test('Click login', async () => {
    //     await Driver.clickElement({ xpath: '/html/body/div[1]/div/div/div[1]/div[2]/div[2]/div[1]/form/button' });
    //   });
    // });

    job('Create organization', () => {
      test('Click create organization button', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="new-org-btn"]' }, { waitTime: 60 * 1000 });
      });

      test('Enter organization name', async () => {
        await Driver.sendKeys({ xpath: '//*[@id="name"]' }, values.value.ORG_NAME);
      });

      test('Click create organization button', async () => {
        await Driver.clickElement({ xpath: '/html/body/div[2]/div/div[2]/div/div[2]/div[3]/div/button[2]' }), { waitTime: 10 * 1000 };
      });

      test('Check organization creation', async () => {
        // const orgName = await Driver.getText({ xpath: '//*[@access-id="sb-title"]/div/div/p' });
        // /**
        //  * @note uppercase due to css property: text-transform
        //  */
        // expect(orgName).toBe(values.value.ORG_NAME.toUpperCase());

        await Driver.getText({ xpath: `//*[text()='${values.value.ORG_NAME}']` }, { waitTime: 20000 });
      });
      dost.nextTest();
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
        await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[3]/div/button[2]' });
      });

      test('Check project creation', async () => {
        const createdProjectName = await Driver.getText({ xpath: '//*[@access-id="project-layout-project-name"]' });
        expect(createdProjectName).toBe(values.value.PROJECT_NAME);
      });

      test('Create organization', async () => {
        await Driver.clickElement(
          { xpath: '//*[@access-id="project-layout-org-name"]' },
          {
            focusWindow: true,
          },
        );
      });

      dost.nextTest();
    });

    job('Check sample project creation', () => {
      test('Check sample project creation', async () => {
        const sampleProjectName = await Driver.getText({ xpath: `//*[text()="${values.value.SAMPLE_PROJECT_NAME}"]` }, { focusWindow: true });
        expect(sampleProjectName).toBe(values.value.SAMPLE_PROJECT_NAME);
      });

      test('Click sample project', async () => {
        await Driver.clickElement({ xpath: `//*[text()="${values.value.SAMPLE_PROJECT_NAME}"]` }, { focusWindow: true });
      });

      test('Click app button', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="project-app-tab"]' }, { focusWindow: true });
      });

      test('Check sample app added ', async () => {
        const sampleAppName = await Driver.getText({ xpath: `//*[text()="${values.value.SAMPLE_APP_EXTENSION}"]` }, { focusWindow: true });
        expect(sampleAppName).toBe(values.value.SAMPLE_APP_EXTENSION);
      });

      dost.nextTest();
    });

    runHost(randomId, dost);

    const deviceSettingInfos = [
      // {
      //   name: 'Host device setting',
      //   addTabMenu: '//*[text()="Host"]/../../../div[5]/div/div/button',
      //   listTabMenu: '//*[text()="Host"]/../../../../div[5]/div/div[2]/button',
      //   tag: values.value.HOST_DEVICE_TAG,
      //   isHost: true,
      // },
      {
        name: 'Android device setting',
        addTabMenu: '//*[@icon-id="android-icon"]/../../../div[5]/div/div/button',
        listTabMenu: '//*[@icon-id="android-icon"]/../../../div[5]/div/div[2]/button',
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

          test('Add to project', async () => {
            await Driver.sendKeys({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/input' }, values.value.PROJECT_NAME);

            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/div/div[1]/div' });
            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/span/span/span' });
            await Timer.wait(3000, 'wait for editor to load');

            // await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/span/span/span' });
            // await Timer.wait(3000, 'wait for editor to load');

            await Driver.sendKeys({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/input' }, values.value.SAMPLE_PROJECT_NAME);
            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/div/div[1]/div' });
            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '//button[@aria-label="Close"]' });
            // await Timer.wait(3000, 'wait for editor to load');
            // await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/button' });

            await waitUntilModalClosed();
          });
        });

        job('Add tag', () => {
          test('Click tag tab', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="org-tag-list-tab"]' });
          });

          test('Click add tag', async () => {
            await Driver.clickElement({ xpath: '/html/body/div/div/section/main/div/div[2]/div[2]/div/div[1]/div/div/button' });
          });

          test('Enter tag', async () => {
            await Driver.sendKeys({ xpath: '/html/body/div[2]/div/div[2]/div/div[2]/div[2]/form/div/div/div[2]/div/div/input' }, tag);
          });

          test('Click create tag button', async () => {
            await Driver.clickElement({ xpath: '/html/body/div[2]/div/div[2]/div/div[2]/div[3]/div/button[2]' });

            await waitUntilModalClosed();
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
            await Driver.sendKeys({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/input' }, tag);
          });

          test('Click tag', async () => {
            await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/div/div[1]/div' });
          });

          test('Close tag change window', async () => {
            await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/button' });
            await waitUntilModalClosed();
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

          test('Check streaming input ', async () => {
            const xpath = isHost ? '//*[@alt="volume down"]/..' : '//*[@data-icon="home"]/../..';
            await Driver.clickElement({ xpath });
            await Timer.wait(5000, 'wait for input processing');
            const logs = await Driver.logs();
            const pattern = isHost ? /.*e2e.*DEVICE_CONTROL_KEYCODE_VOLUME_DOWN.*(request|success).*/ : /.*e2e.*DEVICE_CONTROL_KEYCODE_HOME.*(request|success).*/;
            const hasLog = logs.filter((log) => log.message.match(pattern)).length >= 2;
            expect(hasLog).toBe(true);
          });
        });
      });
    });

    job('Test sample routine', () => {
      job('Add routine', () => {
        test('Go to project menu', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="side-bar-project"]' });
        });

        test('Click sample project', async () => {
          await Driver.clickElement({ xpath: `//a[text()="${values.value.SAMPLE_PROJECT_NAME}"]` });
        });
      });

      job('Execute sample ', () => {
        test('Clikc sample routine', async () => {
          await Driver.clickElement({ xpath: `//*[text()="${values.value.SAMPLE_ROUTINE_NAME}"]` });
        });

        test('Click sample routine execute button', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="run-routine-btn"]' });
        });

        test('Check sample routine execution', async () => {
          for (let i = 0; i < 60; i++) {
            try {
              await Driver.clickElement({ xpath: '//*[@access-id="refresh-btn"]' });
              const state = await Driver.getText({ xpath: `//*[text()="${l10n('SUCCESS')}"]` }, { waitTime: 10000 });
              expect(state).toBe(l10n('SUCCESS'));
              break;
            } catch (e) {
              if (i === 2) {
                throw e;
              }
            }
          }
        });

        test('Go to organization page', async () => {
          await Driver.clickElement({ xpath: `//*[text()="${values.value.ORG_NAME}"]/..` });
        });
      });
    });

    job('Test routine', () => {
      job('Add routine', () => {
        test('Go to project menu', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="side-bar-project"]' });
        });

        test('Click test project', async () => {
          await Driver.clickElement({ xpath: `//a[text()="${values.value.PROJECT_NAME}"]` });
        });

        test('Click pipeline tab', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="project-routine-tab"]' });
        });

        test('Click add routine button', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="add-routine-btn"]' });
        });

        test('Click routine yaml edit button', async () => {
          const elems = await Driver.findElements({ className: 'ant-radio-button-wrapper' });
          const elemInfos = await Promise.all(
            elems.map(async (e) => {
              return {
                elem: e,
                text: await e.getText(),
              };
            }),
          );
          console.log(elemInfos);
          const elem = elemInfos.find((e) => e.text.toLowerCase().includes('yaml'))!.elem;
          if (!elem) {
            throw new Error('YAML radio button not found');
          }
          await elem.click();
        });

        test('Write routine file', async () => {
          await Driver.findElement({ className: 'monaco-editor-background' });

          await Timer.wait(3000, 'wait for editor to load');

          const size = await Driver.getWindowSize();
          // click editor
          await Driver.clickCoordinates(Number((size.width / 2).toFixed(0)), Number((size.height / 2).toFixed(0)));
          // send select all key and delete sample

          let cmdOrCtrl = Key.CONTROL;

          switch (process.platform) {
            case 'darwin':
              cmdOrCtrl = Key.COMMAND;
              console.log('mac');
              break;
            default:
              cmdOrCtrl = Key.CONTROL;
              break;
          }

          for (let i = 0; i < 3; i++) {
            await Driver.sendKeysWithPressedKey(cmdOrCtrl, 'a');
            await Timer.wait(100, 'wait for editor to load');
            await Driver.sendKeysToActiveElement(Key.BACK_SPACE);
            await Timer.wait(100, 'wait for editor to load');
          }

          await Timer.wait(1000, 'wait for editor to load');

          const lines = routineYamlContent.split('\n');
          for (const l of lines) {
            await Driver.actions()
              .sendKeys(l)
              .pause(10)
              .sendKeys(Key.chord(Key.SHIFT, Key.ENTER))
              .pause(10)
              .sendKeys(Key.ARROW_DOWN)
              .pause(10)
              .sendKeys(Key.HOME)
              .pause(10)
              .perform();
          }
        });

        test('Click create routine button', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="save-routine-btn"]' }, { waitTime: 5 * 1000 });
        });
      });

      job('Execute routine', () => {
        test('Click routine', async () => {
          await Driver.clickElement({ xpath: `//*[text()="${values.value.ROUTINE_NAME}"]` });
        });

        test('Click routine execute button', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="run-routine-btn"]' });
        });

        test('Check routine execution', async () => {
          // retry 3 times
          for (let i = 0; i < 3; i++) {
            try {
              await Driver.clickElement({ xpath: '//*[@access-id="refresh-btn"]' });
              const state = await Driver.getText({ xpath: `//*[text()="${l10n('SUCCESS')}"]` }, { waitTime: 1000 });
              expect(state).toBe(l10n('SUCCESS'));
              break;
            } catch (e) {
              if (i === 2) {
                throw e;
              }
            }
          }
        });

        test('Go to organization page', async () => {
          await Driver.clickElement({ xpath: `//*[text()="${values.value.ORG_NAME}"]/..` });
        });
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
      });

      test('Check invite result', async () => {
        const invitedUserEmail = await Driver.getText({ xpath: `//*[text()="${values.value.INVITE_USER_NAME}"]` }, { focusWindow: true });
        expect(invitedUserEmail).toBe(values.value.INVITE_USER_NAME);
      });

      // email invite.
      // test('Go to invite email page', async () => {
      //   await Driver.clickElement({ xpath: '//*[@access-id="org-invitation-tab"]' });
      // });

      // test('Check invite result', async () => {
      //   const state = await Driver.getText({ xpath: `//*[text()="${l10n('PENDING')}"]` });
      //   expect(state).toBe(l10n('PENDING'));
      // });
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
    });

    afterAll(async () => {
      // await screenRecordStopper?.stop();

      if (gdcRecorder) {
        await Timer.wait(2000, 'capture more seconds');
        await gdcRecorder.stop();
      }

      Timer.close();

      await Driver.close();
      ProcessManager.close();
    });
  });
});
