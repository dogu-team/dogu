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

export interface TutorialSdkSupportInfo {
  frameworksPerLang: { [key in TutorialSupportLanguage]?: TutorialSupportFramework[] };
  targetsPerPlatform: { [key in TutorialSupportPlatform]?: TutorialSupportTarget[] };
  defaultOptions: {
    framework: TutorialSupportFramework;
    platform: TutorialSupportPlatform;
    target: TutorialSupportTarget;
  };
}

export type TutorialSdkSupportInfoMap = {
  [key in TutorialSupportSdk]: TutorialSdkSupportInfo;
};
