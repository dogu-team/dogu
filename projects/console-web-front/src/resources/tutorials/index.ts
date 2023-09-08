export const REMOTE_SAMPLE_GIT_URL = 'https://github.com/dogu-team/dogu-examples.git';
export const ROUTINE_SAMPLE_GIT_URL = 'https://github.com/dogu-team/dogu-routine-examples.git';

export enum TutorialSupportSdk {
  APPIUM = 'appium',
  WEBDRIVERIO = 'webdriverio',
  SELENIUM = 'selenium',
  GAMIUM = 'gamium',
}

export enum TutorialSupportLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
}

export enum TutorialSupportPlatform {
  ANDROID = 'android',
  IOS = 'ios',
  WINDOWS = 'windows',
  MACOS = 'macos',
}

export enum TutorialSupportTarget {
  WEB = 'web',
  APP = 'app',
  UNITY = 'unity',
}

export enum TutorialSupportFramework {
  PYTEST = 'Pytest',
  JEST = 'Jest',
  TYPESCRIPT = 'Typescript',
}

export const tutorialSupportSdkText: { [key in TutorialSupportSdk]: string } = {
  [TutorialSupportSdk.APPIUM]: 'Appium',
  [TutorialSupportSdk.WEBDRIVERIO]: 'WebdriverIO',
  [TutorialSupportSdk.SELENIUM]: 'Selenium',
  [TutorialSupportSdk.GAMIUM]: 'Gamium',
};

export const tutorialSupportLanguageText: { [key in TutorialSupportLanguage]: string } = {
  [TutorialSupportLanguage.PYTHON]: 'Python',
  [TutorialSupportLanguage.JAVASCRIPT]: 'JavaScript',
  [TutorialSupportLanguage.TYPESCRIPT]: 'TypeScript',
};

export const tutorialSupportPlatformText: { [key in TutorialSupportPlatform]: string } = {
  [TutorialSupportPlatform.ANDROID]: 'Android',
  [TutorialSupportPlatform.IOS]: 'iOS',
  [TutorialSupportPlatform.WINDOWS]: 'Windows',
  [TutorialSupportPlatform.MACOS]: 'macOS',
};

export const tutorialSupportTargetText: { [key in TutorialSupportTarget]: string } = {
  [TutorialSupportTarget.WEB]: 'Web',
  [TutorialSupportTarget.APP]: 'App',
  [TutorialSupportTarget.UNITY]: 'Unity Engine',
};

export const tutorialSdkSupportInfo: {
  [key in TutorialSupportSdk]: {
    frameworksPerLang: { [key in TutorialSupportLanguage]?: TutorialSupportFramework[] };
    targetsPerPlatform: { [key in TutorialSupportPlatform]?: TutorialSupportTarget[] };
    defaultOptions: {
      framework: TutorialSupportFramework;
      platform: TutorialSupportPlatform;
      target: TutorialSupportTarget;
    };
  };
} = {
  [TutorialSupportSdk.APPIUM]: {
    frameworksPerLang: {
      [TutorialSupportLanguage.PYTHON]: [TutorialSupportFramework.PYTEST],
    },
    targetsPerPlatform: {
      [TutorialSupportPlatform.ANDROID]: [TutorialSupportTarget.WEB, TutorialSupportTarget.APP],
      [TutorialSupportPlatform.IOS]: [TutorialSupportTarget.WEB, TutorialSupportTarget.APP],
    },
    defaultOptions: {
      framework: TutorialSupportFramework.PYTEST,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.WEB,
    },
  },
  [TutorialSupportSdk.WEBDRIVERIO]: {
    frameworksPerLang: {
      [TutorialSupportLanguage.JAVASCRIPT]: [TutorialSupportFramework.JEST],
    },
    targetsPerPlatform: {
      [TutorialSupportPlatform.ANDROID]: [TutorialSupportTarget.WEB, TutorialSupportTarget.APP],
      [TutorialSupportPlatform.IOS]: [TutorialSupportTarget.WEB, TutorialSupportTarget.APP],
      [TutorialSupportPlatform.WINDOWS]: [TutorialSupportTarget.WEB],
      [TutorialSupportPlatform.MACOS]: [TutorialSupportTarget.WEB],
    },
    defaultOptions: {
      framework: TutorialSupportFramework.JEST,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.WEB,
    },
  },
  [TutorialSupportSdk.SELENIUM]: {
    frameworksPerLang: {
      [TutorialSupportLanguage.PYTHON]: [TutorialSupportFramework.PYTEST],
    },
    targetsPerPlatform: {
      [TutorialSupportPlatform.WINDOWS]: [TutorialSupportTarget.WEB],
      [TutorialSupportPlatform.MACOS]: [TutorialSupportTarget.WEB],
    },
    defaultOptions: {
      framework: TutorialSupportFramework.PYTEST,
      platform: TutorialSupportPlatform.WINDOWS,
      target: TutorialSupportTarget.WEB,
    },
  },
  [TutorialSupportSdk.GAMIUM]: {
    frameworksPerLang: {
      [TutorialSupportLanguage.JAVASCRIPT]: [TutorialSupportFramework.JEST],
      [TutorialSupportLanguage.PYTHON]: [TutorialSupportFramework.PYTEST],
    },
    targetsPerPlatform: {
      [TutorialSupportPlatform.ANDROID]: [TutorialSupportTarget.UNITY],
      [TutorialSupportPlatform.IOS]: [TutorialSupportTarget.UNITY],
    },
    defaultOptions: {
      framework: TutorialSupportFramework.JEST,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.UNITY,
    },
  },
};
