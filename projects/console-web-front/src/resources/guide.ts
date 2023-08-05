import { OrganizationId, ProjectId } from '@dogu-private/types';

import { getPersonalAccessToken } from '../api/user';

export const SAMPLE_GIT_URL = 'https://github.com/dogu-team/dogu-examples.git';

export enum GuideSupportSdk {
  APPIUM = 'appium',
  WEBDRIVERIO = 'webdriverio',
  SELENIUM = 'selenium',
  GAMIUM = 'gamium',
}

export enum GuideSupportLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
}

export enum GuideSupportPlatform {
  ANDROID = 'android',
  IOS = 'ios',
  WINDOWS = 'windows',
  MACOS = 'macos',
}

export enum GuideSupportTarget {
  WEB = 'web',
  APP = 'app',
  UNITY = 'unity',
}

export enum GuideSupportFramework {
  PYTEST = 'Pytest',
  JEST = 'Jest',
  TYPESCRIPT = 'Typescript',
}

export const guideSupportSdkText: { [key in GuideSupportSdk]: string } = {
  [GuideSupportSdk.APPIUM]: 'Appium',
  [GuideSupportSdk.WEBDRIVERIO]: 'WebdriverIO',
  [GuideSupportSdk.SELENIUM]: 'Selenium',
  [GuideSupportSdk.GAMIUM]: 'Gamium',
};

export const guideSupportLanguageText: { [key in GuideSupportLanguage]: string } = {
  [GuideSupportLanguage.PYTHON]: 'Python',
  [GuideSupportLanguage.JAVASCRIPT]: 'JavaScript',
  [GuideSupportLanguage.TYPESCRIPT]: 'TypeScript',
};

export const guideSupportPlatformText: { [key in GuideSupportPlatform]: string } = {
  [GuideSupportPlatform.ANDROID]: 'Android',
  [GuideSupportPlatform.IOS]: 'iOS',
  [GuideSupportPlatform.WINDOWS]: 'Windows',
  [GuideSupportPlatform.MACOS]: 'macOS',
};

export const guideSupportTargetText: { [key in GuideSupportTarget]: string } = {
  [GuideSupportTarget.WEB]: 'Web',
  [GuideSupportTarget.APP]: 'App',
  [GuideSupportTarget.UNITY]: 'Unity Engine',
};

export type GenerateCapabilitiesCodeParams = {
  framework: GuideSupportFramework;
  target: GuideSupportTarget;
  platform: GuideSupportPlatform;
  orgId: string;
  projectId: string;
  userId: string;
};

export interface GuideDetailData {
  framework: GuideSupportFramework;
  language: GuideSupportLanguage;
  platform: GuideSupportPlatform;
  target: GuideSupportTarget;
  cd: string;
  installDependencies: string;
  hasSampleApp?: boolean;
  runCommand: string;
  sampleFilePath: string;
}

export interface Guide {
  supportFrameworks: { [key in GuideSupportLanguage]?: GuideSupportFramework[] };
  platformAndTarget: { [key in GuideSupportPlatform]?: GuideSupportTarget[] };
  defaultOptions: {
    framework: GuideSupportFramework;
    platform: GuideSupportPlatform;
    target: GuideSupportTarget;
  };
  generateCapabilitiesCode: (params: GenerateCapabilitiesCodeParams) => Promise<string>;
  guides: GuideDetailData[];
}

export interface GuideProps {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

export const appiumGuideData: Guide = {
  supportFrameworks: {
    [GuideSupportLanguage.PYTHON]: [GuideSupportFramework.PYTEST],
  },
  platformAndTarget: {
    [GuideSupportPlatform.ANDROID]: [GuideSupportTarget.WEB, GuideSupportTarget.APP],
    [GuideSupportPlatform.IOS]: [GuideSupportTarget.WEB, GuideSupportTarget.APP],
  },
  defaultOptions: {
    framework: GuideSupportFramework.PYTEST,
    platform: GuideSupportPlatform.ANDROID,
    target: GuideSupportTarget.WEB,
  },
  generateCapabilitiesCode: async ({ framework, platform, target, orgId, projectId, userId }: GenerateCapabilitiesCodeParams) => {
    let pat: string;

    try {
      pat = await getPersonalAccessToken(userId);
    } catch (e) {
      pat = 'INSERT_YOUR_ORGANIZATION_API_TOKEN';
    }

    return `{
  "version": 1,
  "apiBaseUrl": "${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}",
  "organizationId": "${orgId}",
  "projectId": "${projectId}",
  "token": "${pat}", // see https://docs.dogutech.io/api
  "runsOn": "${platform}",  // or another device tag
  ${
    target === GuideSupportTarget.WEB
      ? `"browserName": "${platform === GuideSupportPlatform.IOS ? 'safari' : 'chrome'}",`
      : `"appVersion": "${platform === GuideSupportPlatform.ANDROID ? '2.5.194-alpha-2017-05-30' : 'INSERT_YOUR_APP_VERSION'}",`
  }
}
`;
  },
  guides: [
    {
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/appium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest web/test_web.py`,
      sampleFilePath: 'web/test_web.py',
    },
    {
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/appium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest web/test_web.py`,
      sampleFilePath: 'web/test_web.py',
    },
    {
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/appium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      hasSampleApp: true,
      runCommand: `pytest app/test_android.py`,
      sampleFilePath: 'app/test_android.py',
    },
    {
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/appium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      hasSampleApp: false,
      runCommand: `python3 ios/app.py`,
      sampleFilePath: 'ios/app.py',
    },
  ],
};

export const webdriverioGuideData: Guide = {
  supportFrameworks: {
    [GuideSupportLanguage.JAVASCRIPT]: [GuideSupportFramework.JEST],
  },
  platformAndTarget: {
    [GuideSupportPlatform.ANDROID]: [GuideSupportTarget.WEB, GuideSupportTarget.APP],
    [GuideSupportPlatform.IOS]: [GuideSupportTarget.WEB, GuideSupportTarget.APP],
    [GuideSupportPlatform.WINDOWS]: [GuideSupportTarget.WEB],
    [GuideSupportPlatform.MACOS]: [GuideSupportTarget.WEB],
  },
  defaultOptions: {
    framework: GuideSupportFramework.JEST,
    platform: GuideSupportPlatform.ANDROID,
    target: GuideSupportTarget.WEB,
  },
  generateCapabilitiesCode: async ({ framework, platform, target, orgId, projectId, userId }: GenerateCapabilitiesCodeParams) => {
    let pat: string;

    try {
      pat = await getPersonalAccessToken(userId);
    } catch (e) {
      pat = 'INSERT_YOUR_ORGANIZATION_API_TOKEN';
    }

    return `{
  "version": 1,
  "apiBaseUrl": "${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}",
  "organizationId": "${orgId}",
  "projectId": "${projectId}",
  "token": "${pat}", // see https://docs.dogutech.io/api
  "runsOn": "${platform}",  // or another device tag
  ${
    target === GuideSupportTarget.WEB
      ? `"browserName": "${platform === GuideSupportPlatform.IOS ? 'safari' : 'chrome'}",`
      : `"appVersion": "${platform === GuideSupportPlatform.ANDROID ? '2.5.194-alpha-2017-05-30' : 'INSERT_YOUR_APP_VERSION'}",`
  }
}
`;
  },
  guides: [
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:web`,
      sampleFilePath: 'web/web.test.js',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:web`,
      sampleFilePath: 'web/web.test.ts',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.WINDOWS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:web`,
      sampleFilePath: 'web/web.test.ts',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.MACOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:web`,
      sampleFilePath: 'web/web.test.ts',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      hasSampleApp: true,
      runCommand: `npm run test:app:android`,
      sampleFilePath: 'app/android.test.js',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      hasSampleApp: false,
      runCommand: 'npm run test:app:ios',
      sampleFilePath: 'app/ios.test.js',
    },
  ],
};

export const seleniumData: Guide = {
  supportFrameworks: {
    [GuideSupportLanguage.PYTHON]: [GuideSupportFramework.PYTEST],
  },
  platformAndTarget: {
    [GuideSupportPlatform.WINDOWS]: [GuideSupportTarget.WEB],
    [GuideSupportPlatform.MACOS]: [GuideSupportTarget.WEB],
  },
  defaultOptions: {
    framework: GuideSupportFramework.PYTEST,
    platform: GuideSupportPlatform.WINDOWS,
    target: GuideSupportTarget.WEB,
  },
  generateCapabilitiesCode: async ({ framework, platform, target, orgId, projectId, userId }: GenerateCapabilitiesCodeParams) => {
    let pat: string;

    try {
      pat = await getPersonalAccessToken(userId);
    } catch (e) {
      pat = 'INSERT_YOUR_TOKEN';
    }

    return `{
  "version": 1,
  "apiBaseUrl": "${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}",
  "organizationId": "${orgId}",
  "projectId": "${projectId}",
  "token": "${pat}", // see https://docs.dogutech.io/api
  "runsOn": "${platform}",  // or another device tag
  "browserName": "chrome",
}
`;
  },
  guides: [
    {
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.WINDOWS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/selenium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest desktop/test_web.py`,
      sampleFilePath: 'desktop/test_web.py',
    },
    {
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.MACOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/selenium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest desktop/test_web.py`,
      sampleFilePath: 'desktop/test_web.py',
    },
  ],
};

export const gamiumGuideData: Guide = {
  supportFrameworks: {
    [GuideSupportLanguage.JAVASCRIPT]: [GuideSupportFramework.JEST],
    [GuideSupportLanguage.PYTHON]: [GuideSupportFramework.PYTEST],
  },
  platformAndTarget: {
    [GuideSupportPlatform.ANDROID]: [GuideSupportTarget.UNITY],
    // [GuideSupportPlatform.IOS]: [GuideSupportTarget.UNITY],
  },
  defaultOptions: {
    framework: GuideSupportFramework.JEST,
    platform: GuideSupportPlatform.ANDROID,
    target: GuideSupportTarget.UNITY,
  },
  generateCapabilitiesCode: async ({ framework, userId, platform, target, orgId, projectId }: GenerateCapabilitiesCodeParams) => {
    let pat: string;

    try {
      pat = await getPersonalAccessToken(userId);
    } catch (e) {
      pat = 'INSERT_YOUR_ORGANIZATION_API_TOKEN';
    }

    return `{
  "version": 1,
  "apiBaseUrl": "${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}",
  "organizationId": "${orgId}",
  "projectId": "${projectId}",
  "token": "${pat}", // see https://docs.dogutech.io/api
  "runsOn": "${platform}",  // or another device tag
  "appVersion": "${platform === GuideSupportPlatform.ANDROID ? '2.0.5' : 'INSERT_YOUR_APP_VERSION'}",
}
`;
  },
  guides: [
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.UNITY,
      cd: 'cd dogu-examples/gamium/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:app:android`,
      hasSampleApp: true,
      sampleFilePath: 'app/android.dogurpgsample.test.js',
    },
    {
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.UNITY,
      cd: 'cd dogu-examples/gamium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest app/test_dogurpgsample.py`,
      hasSampleApp: true,
      sampleFilePath: 'app/test_dogurpgsample.py',
    },
  ],
};

export const tutorialData: { [key in GuideSupportSdk]: Guide } = {
  [GuideSupportSdk.APPIUM]: appiumGuideData,
  [GuideSupportSdk.WEBDRIVERIO]: webdriverioGuideData,
  [GuideSupportSdk.SELENIUM]: seleniumData,
  [GuideSupportSdk.GAMIUM]: gamiumGuideData,
};
