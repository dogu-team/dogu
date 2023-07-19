import { OrganizationId, ProjectId } from '@dogu-private/types';
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
  generateCapabilitiesCode: async ({ framework, platform, target, orgId, projectId }: GenerateCapabilitiesCodeParams) => {
    switch (framework) {
      case GuideSupportFramework.PYTEST:
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
      ${
        target === GuideSupportTarget.WEB
          ? `"browserName": "chrome"`
          : `"appVersion": "${platform === GuideSupportPlatform.ANDROID ? '2.5.194-alpha-2017-05-30' : 'YOUR_APP_VERSION'}"`
      },
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
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/appium/python',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `python3 android/chrome.py`,
      sampleFilePath: 'android/chrome.py',
    },
    {
      framework: GuideSupportFramework.PYTEST,
      language: GuideSupportLanguage.PYTHON,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/appium/python',
      installDependencies: 'pip install -r requirements.txt',
      runCommand: `python3 ios/chrome.py`,
      sampleFilePath: 'ios/chrome.py',
    },
    {
      framework: GuideSupportFramework.PYTEST,
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
      framework: GuideSupportFramework.PYTEST,
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
  generateCapabilitiesCode: async ({ framework, platform, target, orgId, projectId }: GenerateCapabilitiesCodeParams) => {
    switch (framework) {
      case GuideSupportFramework.JEST:
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
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:android:web`,
      sampleFilePath: 'android/chrome.js',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:ios:web`,
      sampleFilePath: 'ios/chrome.js',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.WINDOWS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:windows:web`,
      sampleFilePath: 'windows/chrome.js',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.MACOS,
      target: GuideSupportTarget.WEB,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      runCommand: `npm run test:macos:web`,
      sampleFilePath: 'macos/chrome.js',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.ANDROID,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      hasSampleApp: true,
      runCommand: `npm run test:android:app`,
      sampleFilePath: 'android/app.js',
    },
    {
      framework: GuideSupportFramework.JEST,
      language: GuideSupportLanguage.JAVASCRIPT,
      platform: GuideSupportPlatform.IOS,
      target: GuideSupportTarget.APP,
      cd: 'cd dogu-examples/webdriverio/javascript',
      installDependencies: 'npm install',
      hasSampleApp: false,
      runCommand: `npm run test:ios:app`,
      sampleFilePath: 'ios/app.js',
    },
  ],
};

export const gamiumGuideData: Guide = {
  supportFrameworks: {
    [GuideSupportLanguage.TYPESCRIPT]: [GuideSupportFramework.TYPESCRIPT],
  },
  platformAndTarget: {
    [GuideSupportPlatform.ANDROID]: [GuideSupportTarget.UNITY],
    [GuideSupportPlatform.IOS]: [GuideSupportTarget.UNITY],
  },
  defaultOptions: {
    framework: GuideSupportFramework.TYPESCRIPT,
    platform: GuideSupportPlatform.ANDROID,
    target: GuideSupportTarget.UNITY,
  },
  generateCapabilitiesCode: async ({ framework, platform, target, orgId, projectId }: GenerateCapabilitiesCodeParams) => {
    return '';
  },
  guides: [],
};

export const tutorialData: { [key in GuideSupportSdk]: Guide } = {
  [GuideSupportSdk.APPIUM]: appiumGuideData,
  [GuideSupportSdk.WEBDRIVERIO]: webdriverioGuideData,
  [GuideSupportSdk.GAMIUM]: gamiumGuideData,
};
