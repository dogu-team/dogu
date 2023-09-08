import { TutorialSupportFramework, TutorialSupportLanguage, TutorialSupportPlatform, TutorialSupportSdk, TutorialSupportTarget } from '.';

export interface RoutineTutorial {
  guides: {
    framework: TutorialSupportFramework;
    language: TutorialSupportLanguage;
    platform: TutorialSupportPlatform;
    target: TutorialSupportTarget;
    cwd: string;
    hasSampleApp?: boolean;
    environment: 'node' | 'python';
    command: string;
  }[];
}

export const appiumRoutineTutorialData: RoutineTutorial = {
  guides: [
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.WEB,
      cwd: 'appium/python/pytest',
      environment: 'python',
      command: '',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.WEB,
      cwd: 'appium/python/pytest',
      environment: 'python',
      command: '',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.APP,
      hasSampleApp: true,
      cwd: 'appium/python/pytest',
      environment: 'python',
      command: `pip install -r requirements.txt
            pytest app/test_android.py`,
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.APP,
      hasSampleApp: false,
      cwd: 'appium/python/pytest',
      environment: 'python',
      command: `pip install -r requirements.txt
            pytest app/test_android.py`,
    },
  ],
};

export const webdriverioRoutineTutorialData: RoutineTutorial = {
  guides: [
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.WEB,
      cwd: 'webdriverio/javascript/jest',
      environment: 'node',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.WEB,
      cwd: 'webdriverio/javascript/jest',
      environment: 'node',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.WINDOWS,
      target: TutorialSupportTarget.WEB,
      cwd: 'webdriverio/javascript/jest',
      environment: 'node',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.MACOS,
      target: TutorialSupportTarget.WEB,
      cwd: 'webdriverio/javascript/jest',
      environment: 'node',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.APP,
      hasSampleApp: true,
      cwd: 'webdriverio/javascript/jest',
      environment: 'node',
      command: `npm install
            npm run test:app:android`,
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.APP,
      hasSampleApp: false,
      cwd: 'webdriverio/javascript/jest',
      environment: 'node',
      command: `npm install
            npm run test:app:android`,
    },
  ],
};

export const seleniumRoutineTutorialData: RoutineTutorial = {
  guides: [
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.WINDOWS,
      target: TutorialSupportTarget.WEB,
      cwd: 'selenium/python/pytest',
      environment: 'python',
      command: `pip install -r requirements.txt
            pytest web/test_web.py`,
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.MACOS,
      target: TutorialSupportTarget.WEB,
      cwd: 'selenium/python/pytest',
      environment: 'python',
      command: `pip install -r requirements.txt
            pytest web/test_web.py`,
    },
  ],
};

export const gamiumRoutineTutorialData: RoutineTutorial = {
  guides: [
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.UNITY,
      hasSampleApp: true,
      cwd: 'gamium/javascript/jest',
      environment: 'node',
      command: `npm install
            npm run test:app`,
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.UNITY,
      hasSampleApp: false,
      cwd: 'gamium/javascript/jest',
      environment: 'node',
      command: `npm install
            npm run test:app`,
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.UNITY,
      hasSampleApp: true,
      cwd: 'gamium/python/pytest',
      environment: 'python',
      command: `pip install -r requirements.txt
            pytest app/test_android.py --capture=no -x`,
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.UNITY,
      hasSampleApp: false,
      cwd: 'gamium/python/pytest',
      environment: 'python',
      command: `pip install -r requirements.txt
            pytest app/test_android.py --capture=no -x`,
    },
  ],
};

export const routineTutorialData: { [key in TutorialSupportSdk]: RoutineTutorial } = {
  [TutorialSupportSdk.APPIUM]: appiumRoutineTutorialData,
  [TutorialSupportSdk.WEBDRIVERIO]: webdriverioRoutineTutorialData,
  [TutorialSupportSdk.SELENIUM]: seleniumRoutineTutorialData,
  [TutorialSupportSdk.GAMIUM]: gamiumRoutineTutorialData,
};
