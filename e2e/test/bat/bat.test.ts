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
import { prepareDB } from './bat/db';
import { runHost } from './bat/host';
import { currentL10n, l10n } from './bat/l10n';
import { startConsole } from './bat/workspace';

const isCI = process.env.CI === 'true' || undefined !== process.env.GITHUB_ACTION;
const switchConfig = {
  prepareDB: isCI ? true : false,
};

const env = loadEnvLazySync(E2eEnv);

dotenv.config({ path: path.join(__dirname, '.env') });

const random = Utils.random();
let gdcRecorder: GdcScreenRecorder | null = null;
// let screenRecordStopper: ScreenRecordStopper | null = null;

const values = {
  value: {
    HOME_URL: '',
    USER_NAME: 'test',
    USER_EMAIL: `test${random}@dogutech.io`,
    INVITE_USER_EMAIL: `test@dogutech.io`,
    ORG_NAME: `Test Org`,
    PROJECT_NAME: 'Test Project',
    TEAM_NAME: `test team ${random}`,
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
      values.value.HOME_URL = `http://localhost:${env.CONSOLE_WEB_FRONT_PORT}`;

      await ProcessManager.killByPorts([Number(env.DOGU_CONSOLE_WEB_SERVER_PORT), Number(env.CONSOLE_WEB_FRONT_PORT), Number(env.DOGU_DEVICE_SERVER_PORT)]);
      await ProcessManager.killByNames(['IOSDeviceController', 'go-device-controller', 'host-agent']);

      // screenRecordStopper = await new ScreenRecorder().start({
      //   outputPath: path.resolve('generated', 'record', 'screen.webm'),
      // });
    });

    if (switchConfig.prepareDB) {
      prepareDB();
    }
    startConsole(env.CONSOLE_WEB_FRONT_PORT);

    job('브라우저 실행', () => {
      test('브라우저 실행', () => {
        Driver.open({ l10n: currentL10n });
      });
      test('녹화 실행', () => {
        gdcRecorder = new GdcScreenRecorder(console);
        gdcRecorder.start();
      });
    });

    job('회원가입', () => {
      test('메인 페이지 이동', async () => {
        await Driver.moveTo(values.value.HOME_URL);
      });

      // Move to signup page due to landing page has no sign up button
      test('회원가입 페이지 이동', async () => {
        await Driver.clickElement({ xpath: '//a[@access-id="sign-up-btn"]' });
      });

      test('회원가입', async () => {
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
    });

    /**
     * @note 회원가입하면 자동 로그인함
     */
    // job('로그인', () => {
    //   test('로그인 페이지 이동', async () => {
    //     await Driver.moveTo(`${values.value.HOME_URL}/signin`);
    //   });

    //   test('이메일 입력', async () => {
    //     await Driver.sendKeys({ xpath: '/html/body/div[1]/div/div/div[1]/div[2]/div[2]/div[1]/form/div[1]/input' }, values.value.USER_EMAIL);
    //   });

    //   test('비밀번호 입력', async () => {
    //     await Driver.sendKeys({ xpath: '/html/body/div[1]/div/div/div[1]/div[2]/div[2]/div[1]/form/div[2]/span/input' }, 'qwer1234!');
    //   });

    //   test('로그인 버튼 클릭', async () => {
    //     await Driver.clickElement({ xpath: '/html/body/div[1]/div/div/div[1]/div[2]/div[2]/div[1]/form/button' });
    //   });
    // });

    job('조직 생성', () => {
      test('조직 생성 버튼 클릭', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="new-org-btn"]' }, { waitTime: 60 * 1000 });
      });

      test('조직 이름 입력', async () => {
        await Driver.sendKeys({ xpath: '//*[@id="name"]' }, values.value.ORG_NAME);
      });

      test('조직 생성 클릭', async () => {
        await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[3]/div/button[2]' });
      });

      test('조직 생성 확인', async () => {
        // const orgName = await Driver.getText({ xpath: '//*[@access-id="sb-title"]/div/div/p' });
        // /**
        //  * @note uppercase due to css property: text-transform
        //  */
        // expect(orgName).toBe(values.value.ORG_NAME.toUpperCase());

        await Driver.getText({ xpath: `//*[text()='${values.value.ORG_NAME}']` }, { waitTime: 20000 });
      });
    });

    job('프로젝트 생성', () => {
      test('프로젝트 메뉴 클릭', async () => {
        await Driver.clickElement(
          { xpath: '//*[@access-id="side-bar-project"]' },
          {
            focusWindow: true,
          },
        );
      });

      test('새 프로젝트 생성 클릭', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="add-project-btn"]' });
      });

      test('프로젝트 정보 입력', async () => {
        await Driver.sendKeys({ xpath: '//*[@id="name"]' }, values.value.PROJECT_NAME);
        await Driver.sendKeys({ xpath: '//*[@id="desc"]' }, 'Test Project Description');
      });

      test('프로젝트 생성 버튼 클릭', async () => {
        await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[3]/div/button[2]' });
      });

      test('프로젝트 생성 확인', async () => {
        const createdProjectName = await Driver.getText({ xpath: '//*[@access-id="project-layout-project-name"]' });
        expect(createdProjectName).toBe(values.value.PROJECT_NAME);
      });

      test('조직 클릭', async () => {
        await Driver.clickElement(
          { xpath: '//*[@access-id="project-layout-org-name"]' },
          {
            focusWindow: true,
          },
        );
      });
    });

    job('sample project 생성 확인', () => {
      test('샘플 프로젝트 생성 확인', async () => {
        const sampleProjectName = await Driver.getText({ xpath: `//*[text()="${values.value.SAMPLE_PROJECT_NAME}"]` }, { focusWindow: true });
        expect(sampleProjectName).toBe(values.value.SAMPLE_PROJECT_NAME);
      });

      test('샘플 프로젝트 클릭', async () => {
        await Driver.clickElement({ xpath: `//*[text()="${values.value.SAMPLE_PROJECT_NAME}"]` }, { focusWindow: true });
      });

      test('앱 버튼 클릭', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="project-app-tab"]' }, { focusWindow: true });
      });

      test('샘플 앱 등록 확인', async () => {
        const sampleAppName = await Driver.getText({ xpath: `//*[text()="${values.value.SAMPLE_APP_EXTENSION}"]` }, { focusWindow: true });
        expect(sampleAppName).toBe(values.value.SAMPLE_APP_EXTENSION);
      });
    });

    runHost(random);

    const deviceSettingInfos = [
      // {
      //   name: 'Host 디바이스 세팅',
      //   addTabMenu: '//*[text()="Host"]/../../../div[5]/div/div/button',
      //   listTabMenu: '//*[text()="Host"]/../../../../div[5]/div/div[2]/button',
      //   tag: values.value.HOST_DEVICE_TAG,
      //   isHost: true,
      // },
      {
        name: 'Android 디바이스 세팅',
        addTabMenu: '//*[@icon-id="android-icon"]/../../../div[5]/div/div/button',
        listTabMenu: '//*[@icon-id="android-icon"]/../../../div[5]/div/div[2]/button',
        tag: values.value.ANDROID_DEVICE_TAG,
        isHost: false,
      },
    ];
    // if (process.platform === 'darwin') {
    //   deviceSettingInfos.push({
    //     name: 'iOS 디바이스 세팅',
    //     addTabMenu: '//*[@data-icon="apple"]/../../../../div[5]/div/div/button',
    //     listTabMenu: '//*[@data-icon="apple"]/../../../../div[5]/div/div[2]/button',
    //     tag: values.value.IOS_DEVICE_TAG,
    //     isHost: false,
    //   });
    // }

    deviceSettingInfos.forEach((deviceSettingInfo) => {
      const { name, addTabMenu, listTabMenu, tag, isHost } = deviceSettingInfo;

      job(name, () => {
        job('디바이스 추가', () => {
          test('디바이스 메뉴 이동', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="side-bar-device"]' });
          });

          test('추가 탭 클릭', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="org-add-device-tab"]' });
          });

          test('메뉴 클릭', async () => {
            await Driver.clickElement({ xpath: addTabMenu });
          });

          test('사용하기 클릭', async () => {
            await Driver.clickElement({ xpath: `//*[text()="${l10n('START_USING')}"]` });
          });

          test('프로젝트에 추가', async () => {
            await Driver.sendKeys({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/input' }, values.value.PROJECT_NAME);
            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[2]/button' });
            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/div/button' });
            await Timer.wait(3000, 'wait for editor to load');

            await Driver.clickElement({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/span/span/span' });
            await Timer.wait(3000, 'wait for editor to load');

            await Driver.sendKeys({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/input' }, values.value.SAMPLE_PROJECT_NAME);
            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[2]/button' });
            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/div/button' });
            await Timer.wait(3000, 'wait for editor to load');
            await Driver.clickElement({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/button' });

            await waitUntilModalClosed();
          });
        });

        job('태그 추가', () => {
          test('태그 탭 클릭', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="org-tag-list-tab"]' });
          });

          test('태그 추가 클릭', async () => {
            await Driver.clickElement({ xpath: '/html/body/div[1]/div/section/main/div[1]/div/div[2]/div/div[1]/div/div/button' });
          });

          test('태그 입력', async () => {
            await Driver.sendKeys({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/form/div/div/div[2]/div/div/input' }, tag);
          });

          test('태그 생성 버튼 클릭', async () => {
            await Driver.clickElement({ xpath: '/html/body/div[3]/div/div[2]/div/div[2]/div[3]/div/button[2]' });
            await waitUntilModalClosed();
          });
        });

        job('디바이스에 태그 추가', () => {
          test('목록 탭 클릭', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="org-device-list-tab"]' });
          });

          test('메뉴 클릭', async () => {
            await Driver.clickElement(
              { xpath: listTabMenu },
              {
                focusWindow: true,
              },
            );
          });

          test('태그 변경 클릭', async () => {
            await Driver.clickElement({ xpath: `//*[text()="${l10n('EDIT_TAGS')}"]` });
          });

          test('태그 입력', async () => {
            await Driver.sendKeys({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/span/span/span[1]/input' }, tag);
          });

          test('태그 클릭', async () => {
            await Driver.clickElement({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/div[2]/div/div[1]/div/button' });
          });

          test('태그 변경하기 창 닫기', async () => {
            await Driver.clickElement({ xpath: '/html/body/div[4]/div/div[2]/div/div[2]/button' });
            await waitUntilModalClosed();
          });
        });

        job('디바이스 스트리밍', () => {
          test('디바이스 메뉴 이동', async () => {
            await Driver.clickElement({ xpath: '//*[@access-id="side-bar-device"]' });
          });

          test('메뉴 클릭', async () => {
            await Driver.clickElement({ xpath: listTabMenu });
          });

          test('스트리밍 버튼 클릭', async () => {
            await Driver.clickElement({ xpath: `//*[text()="${l10n('STREAMING')}"]` });
          });

          test('스트리밍 시작 확인', async () => {
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

          test('스트리밍 입력 전송 확인', async () => {
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

    //
    job('Sample 루틴 테스트', () => {
      job('루틴 추가', () => {
        test('프로젝트 메뉴 이동', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="side-bar-project"]' });
        });

        test('sample 프로젝트 클릭', async () => {
          await Driver.clickElement({ xpath: `//a[text()="${values.value.SAMPLE_PROJECT_NAME}"]` });
        });
      });

      job('sample 루틴 실행', () => {
        test('sample 루틴 클릭', async () => {
          await Driver.clickElement({ xpath: `//*[text()="${values.value.SAMPLE_ROUTINE_NAME}"]` });
        });

        test('sample 루틴 실행 버튼 클릭', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="run-routine-btn"]' });
        });

        test('sample 루틴 실행 확인', async () => {
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

        test('조직 페이지로 이동', async () => {
          await Driver.clickElement({ xpath: `//*[text()="${values.value.ORG_NAME}"]/..` });
        });
      });
    });
    //

    job('루틴 테스트', () => {
      job('루틴 추가', () => {
        test('프로젝트 메뉴 이동', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="side-bar-project"]' });
        });

        test('테스트 프로젝트 클릭', async () => {
          await Driver.clickElement({ xpath: `//a[text()="${values.value.PROJECT_NAME}"]` });
        });

        test('파이프라인 탭 클릭', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="project-routine-tab"]' });
        });

        test('루틴 추가 버튼 클릭', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="add-routine-btn"]' });
        });

        test('루틴 yaml 편집 버튼 클릭', async () => {
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

        test('루틴 파일 작성', async () => {
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

        test('루틴 생성 클릭', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="save-routine-btn"]' });
        });
      });

      job('루틴 실행', () => {
        test('루틴 클릭', async () => {
          await Driver.clickElement({ xpath: `//*[text()="${values.value.ROUTINE_NAME}"]` });
        });

        test('루틴 실행 버튼 클릭', async () => {
          await Driver.clickElement({ xpath: '//*[@access-id="run-routine-btn"]' });
        });

        test('루틴 실행 확인', async () => {
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

        test('조직 페이지로 이동', async () => {
          await Driver.clickElement({ xpath: `//*[text()="${values.value.ORG_NAME}"]/..` });
        });
      });
    });

    job('멤버 추가', () => {
      test('멤버 메뉴 이동', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-member"]' });
      });

      test('멤버 초대 버튼 클릭', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="invite-user-btn"]' });
      });

      test('초대 이메일 입력', async () => {
        await Driver.sendKeys({ xpath: '//input[@access-id="invite-user-input"]' }, values.value.INVITE_USER_EMAIL);
        await Driver.clickElement({ xpath: '//button[@access-id="invite-user-add-email-btn"]' });
      });

      test('초대 권한 선택 및 전송', async () => {
        await Driver.clickElement({ xpath: '//*[@id="invite-user-send-btn"]' });
      });

      test('초대 이메일 페이지 이동', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="org-invitation-tab"]' });
      });

      test('멤버 초대 성공 확인', async () => {
        const state = await Driver.getText({ xpath: `//*[text()="${l10n('PENDING')}"]` });
        expect(state).toBe(l10n('PENDING'));
      });
    });

    job('팀 생성', () => {
      test('팀 메뉴 클릭', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="side-bar-team"]' });
      });

      test('팀 생성 클릭', async () => {
        await Driver.clickElement({ xpath: '//button[@access-id="create-team-btn"]' });
      });

      test('새 팀 생성', async () => {
        await Driver.sendKeys({ xpath: '//input[@id="name"]' }, values.value.TEAM_NAME);
        await Driver.clickElement({ xpath: '//button[@form="new-team"]' });
      });
    });

    job('팀 설정', () => {
      test('팀 페이지 이동', async () => {
        const teamXPath = `//p[text()="${values.value.TEAM_NAME}"]`;
        const teamName = await Driver.getText({ xpath: teamXPath });
        expect(teamName).toBe(values.value.TEAM_NAME);

        await Driver.clickElement({ xpath: teamXPath });
      });

      test('팀 멤버 추가', async () => {
        await Driver.clickElement({ xpath: '//*[@access-id="add-team-member-btn"]' });
        await Driver.sendKeys({ xpath: '//input[@access-id="add-team-member-input"]' }, values.value.USER_NAME);
        await Driver.clickElement({ xpath: '//*[@aria-label="plus"]/..' });

        const [userName, userEmail] = await Promise.all([
          Driver.getText({
            xpath: '/html/body/div[1]/div/section/main/div/div/div/div[2]/div/div[2]/div[2]/div[1]/div/ul/li/div/div[1]/div/div/p[1]',
          }),
          Driver.getText({
            xpath: '/html/body/div[1]/div/section/main/div/div/div/div[2]/div/div[2]/div[2]/div[1]/div/ul/li/div/div[1]/div/div/p[2]',
          }),
        ]);
        expect(userName).toBe(values.value.USER_NAME);
        expect(userEmail).toBe(values.value.USER_EMAIL);
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
