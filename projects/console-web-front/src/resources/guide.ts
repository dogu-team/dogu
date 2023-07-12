import { getApiToken } from '../api/organization';

export const SAMPLE_GIT_URL = 'https://github.com/dogu-team/dogu-examples.git';

export enum GuideSupportLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
}

export const webGuideData = [];

export const mobileGuideData = [
  {
    language: GuideSupportLanguage.PYTHON,
    cd: 'cd dogu-examples/python/appium',
    installDependencies: 'pip install -r requirements.txt',
    generateCapabilitiesCode: async (orgId: string, projectId: string) => {
      let orgAccessKey: string;

      try {
        orgAccessKey = await getApiToken(orgId);
      } catch (e) {
        orgAccessKey = 'INSERT_YOUR_ACCESS_KEY';
      }

      return `// if called from Dogu Routine, the following environment variables will be injected from Dogu Routine.
// if you want to run this script locally, please set your access key here.
access_key = os.environ.get("DOGU_ACCESS_KEY", "${orgAccessKey}")
organization_id = os.environ.get("DOGU_ORGANIZATION_ID", "${orgId}")
project_id = os.environ.get("DOGU_PROJECT_ID", "${projectId}")
api_base_url = os.environ.get("DOGU_API_BASE_URL", "${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}")

// ...

options = UiAutomator2Options().load_capabilities(
  {
    # Specify dogu:options for testing
    "platformName": "android",
    "dogu:options": {
      "accessKey": access_key,
      "organizationId": organization_id,
      "projectId": project_id,
      "tag": "android",
      "appVersion": "2.5.194-alpha-2017-05-30",
    },
  }
)
`;
    },
    runCommand: `python3 android/dogu_sample.py`,
  },
  {
    language: GuideSupportLanguage.JAVASCRIPT,
    cd: 'cd dogu-examples/javascript/appium',
    installDependencies: 'npm install',
    generateCapabilitiesCode: async (orgId: string, projectId: string) => {
      let orgAccessKey: string;

      try {
        orgAccessKey = await getApiToken(orgId);
      } catch (e) {
        orgAccessKey = 'INSERT_YOUR_ACCESS_KEY';
      }

      return `// if called from Dogu Routine, the following environment variables will be injected from Dogu Routine.
// if you want to run this script locally, please set your access key here.
const accessKey = process.env.DOGU_ACCESS_KEY || '${orgAccessKey}';
const organizationId = process.env.DOGU_ORGANIZATION_ID || '${orgId}';
const projectId = process.env.DOGU_PROJECT_ID || '${projectId}';
const apiBaseUrl = process.env.DOGU_API_BASE_URL || '${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}';

// ...

const browser = await remote({
  protocol,
  hostname,
  port,
  path: '/remote/wd/hub',
  capabilities: {
    platformName: "android",
    'appium:automationName': "uiautomator2",
    "dogu:options": {
      accessKey,
      organizationId,
      projectId,
      tag: "android",
      appVersion: "2.5.194-alpha-2017-05-30",
    },
  }
})
`;
    },
    runCommand: `npm run test`,
  },
];
