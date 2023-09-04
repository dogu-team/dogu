import { TutorialSupportFramework, TutorialSupportLanguage, TutorialSupportPlatform, TutorialSupportSdk, TutorialSupportTarget } from '.';

export interface RoutineTutorial {
  guides: {
    framework: TutorialSupportFramework;
    language: TutorialSupportLanguage;
    platform: TutorialSupportPlatform;
    target: TutorialSupportTarget;
    cwd: string;
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
      command: '',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.WEB,
      cwd: 'appium/python/pytest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.APP,
      cwd: 'appium/python/pytest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.APP,
      cwd: 'appium/python/pytest',
      command: '',
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
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.WEB,
      cwd: 'webdriverio/javascript/jest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.WINDOWS,
      target: TutorialSupportTarget.WEB,
      cwd: 'webdriverio/javascript/jest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.MACOS,
      target: TutorialSupportTarget.WEB,
      cwd: 'webdriverio/javascript/jest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.APP,
      cwd: 'webdriverio/javascript/jest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.APP,
      cwd: 'webdriverio/javascript/jest',
      command: '',
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
      command: '',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.MACOS,
      target: TutorialSupportTarget.WEB,
      cwd: 'selenium/python/pytest',
      command: '',
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
      cwd: 'gamium/javascript/jest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.UNITY,
      cwd: 'gamium/javascript/jest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.UNITY,
      cwd: 'gamium/python/pytest',
      command: '',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.UNITY,
      cwd: 'gamium/python/pytest',
      command: '',
    },
  ],
};

export const routineTutorialData: { [key in TutorialSupportSdk]: RoutineTutorial } = {
  [TutorialSupportSdk.APPIUM]: appiumRoutineTutorialData,
  [TutorialSupportSdk.WEBDRIVERIO]: webdriverioRoutineTutorialData,
  [TutorialSupportSdk.SELENIUM]: seleniumRoutineTutorialData,
  [TutorialSupportSdk.GAMIUM]: gamiumRoutineTutorialData,
};
