import { getApiToken } from '../api/organization';

export const SAMPLE_GIT_URL = 'https://github.com/dogu-team/dogu-examples.git';

export enum GuideSupportSdk {
  APPIUM = 'appium',
  WEBDRIVERIO = 'webdriverio',
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
  GAME = 'game',
}

export const guideSupportSdkText: { [key in GuideSupportSdk]: string } = {
  [GuideSupportSdk.APPIUM]: 'Appium',
  [GuideSupportSdk.WEBDRIVERIO]: 'WebdriverIO',
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
  [GuideSupportTarget.GAME]: 'Game',
};

export type GenerateCapabilitiesCodeParams = {
  language: GuideSupportLanguage;
  target: GuideSupportTarget;
  platform: GuideSupportPlatform;
  orgId: string;
  projectId: string;
};

export const appiumGuideData = {
  supportLanguages: [GuideSupportLanguage.PYTHON],
  supportPlatforms: [GuideSupportPlatform.ANDROID, GuideSupportPlatform.IOS],
  supportTargets: [GuideSupportTarget.APP],
  generateCapabilitiesCode: async ({ language, platform, target, orgId, projectId }: GenerateCapabilitiesCodeParams) => {
    switch (language) {
      case GuideSupportLanguage.PYTHON:
        let orgApiToken: string;

        try {
          orgApiToken = await getApiToken(orgId);
        } catch (e) {
          orgApiToken = 'INSERT_YOUR_ORGANIZATION_API_TOKEN';
        }

        return `token = os.environ.get("DOGU_TOKEN", "${orgApiToken}")
organization_id = os.environ.get("DOGU_ORGANIZATION_ID", "${orgId}")
project_id = os.environ.get("DOGU_PROJECT_ID", "${projectId}")
api_base_url = os.environ.get("DOGU_API_BASE_URL", "${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}")

# ...

options = UiAutomator2Options().load_capabilities(
  {
    # Specify dogu:options for testing
    "dogu:options": {
      "token": token,
      "organizationId": organization_id,
      "projectId": project_id,
      "runsOn": "${platform}", # or another device tag
      "appVersion": "${platform === GuideSupportPlatform.ANDROID ? '2.5.194-alpha-2017-05-30' : 'YOUR_APP_VERSION'}",
    },
  }
)
`;
      default:
        return '';
    }
  },
  guides: [
    {
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/appium/python',
      installDependencies: 'pip install -r requirements.txt',
      hasSampleApp: true,
      runCommand: `python3 android/app.py`,
      sampleFilePath: 'android/app.py',
    },
    {
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/appium/python',
      installDependencies: 'pip install -r requirements.txt',
      hasSampleApp: false,
      runCommand: `python3 ios/app.py`,
      sampleFilePath: 'ios/app.py',
    },
  ],
};

export const webdriverioGuideData = {
  supportLanguages: [GuideSupportLanguage.JAVASCRIPT],
  supportPlatforms: [GuideSupportPlatform.ANDROID, GuideSupportPlatform.IOS, GuideSupportPlatform.WINDOWS, GuideSupportPlatform.MACOS],
  supportTargets: [GuideSupportTarget.WEB, GuideSupportTarget.APP],
  generateCapabilitiesCode: async ({ language, platform, target, orgId, projectId }: GenerateCapabilitiesCodeParams) => {
    switch (language) {
      case GuideSupportLanguage.JAVASCRIPT:
        let orgApiToken: string;

        try {
          orgApiToken = await getApiToken(orgId);
        } catch (e) {
          orgApiToken = 'INSERT_YOUR_ORGANIZATION_API_TOKEN';
        }

        return `const token = process.env.DOGU_TOKEN || '${orgApiToken}';
const organizationId = process.env.DOGU_ORGANIZATION_ID || '${orgId}';
const projectId = process.env.DOGU_PROJECT_ID || '${projectId}';
const apiBaseUrl = process.env.DOGU_API_BASE_URL || '${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}';

// ...

const driver = await remote({
  protocol,
  hostname,
  port,
  path: '/remote/wd/hub',
  capabilities: {
    'dogu:options': {
      token,
      organizationId,
      projectId,
      runsOn: '${platform}', // or another device tag
      ${target === GuideSupportTarget.WEB ? "browserName: 'chrome'," : "appVersion: '2.5.194-alpha-2017-05-30',"}
    },
  },
});
`;
      default:
        return '';
    }
  },
  guides: [
    {
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:android:web`,
      sampleFilePath: 'android/chrome.js',
    },
    {
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:ios:web`,
      sampleFilePath: 'ios/chrome.js',
    },
    {
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.WINDOWS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:windows:web`,
      sampleFilePath: 'windows/chrome.js',
    },
    {
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.MACOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:macos:web`,
      sampleFilePath: 'macos/chrome.js',
    },
    {
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:android:app`,
      sampleFilePath: 'android/app.js',
    },
    {
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:ios:app`,
      sampleFilePath: 'ios/app.js',
    },
  ],
};

export const tutorialData: { [key in GuideSupportSdk]: any } = {
  [GuideSupportSdk.APPIUM]: appiumGuideData,
  [GuideSupportSdk.WEBDRIVERIO]: webdriverioGuideData,
  [GuideSupportSdk.GAMIUM]: {},
};
