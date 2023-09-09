import { OrganizationId, ProjectId } from '@dogu-private/types';

import { TutorialSdkSupportInfoMap, TutorialSupportFramework, TutorialSupportLanguage, TutorialSupportPlatform, TutorialSupportSdk, TutorialSupportTarget } from '.';
import { getPersonalAccessToken } from '../../api/user';

export const remoteTutorialSdkSupportInfo: TutorialSdkSupportInfoMap = {
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

export type GenerateCapabilitiesCodeParams = {
  framework: TutorialSupportFramework;
  target: TutorialSupportTarget;
  platform: TutorialSupportPlatform;
  orgId: string;
  projectId: string;
  userId: string;
};

export interface RemoteTutorialDetailData {
  framework: TutorialSupportFramework;
  language: TutorialSupportLanguage;
  platform: TutorialSupportPlatform;
  target: TutorialSupportTarget;
  cd: string;
  installDependencies: string;
  hasSampleApp?: boolean;
  runCommand: string;
  sampleFilePath: string;
}

const isMobile = (platform: TutorialSupportPlatform) => [TutorialSupportPlatform.ANDROID, TutorialSupportPlatform.IOS].includes(platform);

export interface RemoteTutorial {
  generateCapabilitiesCode: (params: GenerateCapabilitiesCodeParams) => Promise<string>;
  guides: RemoteTutorialDetailData[];
}

export interface RemoteTutorialProps {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

export const appiumRemoteTutorialData: RemoteTutorial = {
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
    target === TutorialSupportTarget.WEB
      ? `"browserName": "${platform === TutorialSupportPlatform.IOS ? 'safari' : 'chrome'}", ${isMobile(platform) ? '' : '// available: "safari", "chrome", "firefox"'}`
      : `"appVersion": "${platform === TutorialSupportPlatform.ANDROID ? '2.5.194-alpha-2017-05-30' : 'INSERT_YOUR_APP_VERSION'}",`
  }
}
`;
  },
  guides: [
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.WEB,
      cd: 'cd dogu-examples/appium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest web/test_web.py`,
      sampleFilePath: 'web/test_web.py',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.WEB,
      cd: 'cd dogu-examples/appium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest web/test_web.py`,
      sampleFilePath: 'web/test_web.py',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.APP,
      cd: 'cd dogu-examples/appium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      hasSampleApp: true,
      runCommand: `pytest app/test_android.py`,
      sampleFilePath: 'app/test_android.py',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.APP,
      cd: 'cd dogu-examples/appium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      hasSampleApp: false,
      runCommand: `python3 ios/app.py`,
      sampleFilePath: 'ios/app.py',
    },
  ],
};

export const webdriverioRemoteTutoriallData: RemoteTutorial = {
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
    target === TutorialSupportTarget.WEB
      ? `"browserName": "${platform === TutorialSupportPlatform.IOS ? 'safari' : 'chrome'}", ${isMobile(platform) ? '' : '// available: "safari", "chrome", "firefox"'}`
      : `"appVersion": "${platform === TutorialSupportPlatform.ANDROID ? '2.5.194-alpha-2017-05-30' : 'INSERT_YOUR_APP_VERSION'}",`
  }
}
`;
  },
  guides: [
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:web`,
      sampleFilePath: 'web/web.test.js',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:web`,
      sampleFilePath: 'web/web.test.ts',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.WINDOWS,
      target: TutorialSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:web`,
      sampleFilePath: 'web/web.test.ts',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.MACOS,
      target: TutorialSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:web`,
      sampleFilePath: 'web/web.test.ts',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.APP,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      hasSampleApp: true,
      runCommand: `npm run test:app:android`,
      sampleFilePath: 'app/android.test.js',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.APP,
      cd: 'cd dogu-examples/webdriverio/javascript/jest',
      installDependencies: 'npm install',
      hasSampleApp: false,
      runCommand: 'npm run test:app:ios',
      sampleFilePath: 'app/ios.test.js',
    },
  ],
};

export const seleniumRemoteTutorialGuideData: RemoteTutorial = {
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
  "browserName": "chrome", // available: "safari", "chrome", "firefox"
}
`;
  },
  guides: [
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.WINDOWS,
      target: TutorialSupportTarget.WEB,
      cd: 'cd dogu-examples/selenium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest web/test_web.py`,
      sampleFilePath: 'web/test_web.py',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.MACOS,
      target: TutorialSupportTarget.WEB,
      cd: 'cd dogu-examples/selenium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest web/test_web.py`,
      sampleFilePath: 'web/test_web.py',
    },
  ],
};

export const gamiumRemoteTutorialGuideData: RemoteTutorial = {
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
  "appVersion": "${platform === TutorialSupportPlatform.ANDROID ? '2.0.5' : 'INSERT_YOUR_APP_VERSION'}",
}
`;
  },
  guides: [
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.UNITY,
      cd: 'cd dogu-examples/gamium/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:app`,
      hasSampleApp: true,
      sampleFilePath: 'app/dogurpgsample.test.js',
    },
    {
      framework: TutorialSupportFramework.JEST,
      language: TutorialSupportLanguage.JAVASCRIPT,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.UNITY,
      cd: 'cd dogu-examples/gamium/javascript/jest',
      installDependencies: 'npm install',
      runCommand: `npm run test:app`,
      hasSampleApp: false,
      sampleFilePath: 'app/dogurpgsample.test.js',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.ANDROID,
      target: TutorialSupportTarget.UNITY,
      cd: 'cd dogu-examples/gamium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest app/test_dogurpgsample.py`,
      hasSampleApp: true,
      sampleFilePath: 'app/test_dogurpgsample.py',
    },
    {
      framework: TutorialSupportFramework.PYTEST,
      language: TutorialSupportLanguage.PYTHON,
      platform: TutorialSupportPlatform.IOS,
      target: TutorialSupportTarget.UNITY,
      cd: 'cd dogu-examples/gamium/python/pytest',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `pytest app/test_dogurpgsample.py`,
      hasSampleApp: false,
      sampleFilePath: 'app/test_dogurpgsample.py',
    },
  ],
};

export const remoteTutorialData: { [key in TutorialSupportSdk]: RemoteTutorial } = {
  [TutorialSupportSdk.APPIUM]: appiumRemoteTutorialData,
  [TutorialSupportSdk.WEBDRIVERIO]: webdriverioRemoteTutoriallData,
  [TutorialSupportSdk.SELENIUM]: seleniumRemoteTutorialGuideData,
  [TutorialSupportSdk.GAMIUM]: gamiumRemoteTutorialGuideData,
};
