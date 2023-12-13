export const getRepositoyUrl = (gitUrl: string) => {
  const matches = gitUrl.match(/\/([^/]+\/[^/]+)$/);
  if (matches) {
    return matches[matches.length - 1];
  }

  return gitUrl;
};

export const LANDING_TEMRS_OF_USE_URL = 'https://dogutech.io/notices/terms';
export const LANDING_PRIVACY_POLICY_URL = 'https://dogutech.io/notices/privacy';

export const DoguDocsUrl = {
  _index: () => 'https://docs.dogutech.io',
  'get-started': {
    _index: () => `${DoguDocsUrl._index()}/get-started`,
    installation: {
      'self-hosted': {
        license: () => `${DoguDocsUrl._index()}/get-started/installation/self-hosted/license`,
      },
    },
    tutorials: {
      'test-automation': () => `${DoguDocsUrl._index()}/get-started/tutorials/test-automation`,
      'device-farm': () => `${DoguDocsUrl._index()}/get-started/tutorials/device-farm`,
    },
  },
  integration: {
    notification: {
      slack: {
        _heading: {
          'private-channel': () => `${DoguDocsUrl._index()}/integration/notification/slack#private-channel`,
        },
      },
    },
    cicd: {
      'github-action': () => `${DoguDocsUrl._index()}/integration/cicd/github-action`,
      jenkins: () => `${DoguDocsUrl._index()}/integration/cicd/jenkins`,
    },
  },
  api: {
    organization: {
      application: {
        'upload-application': () => `${DoguDocsUrl._index()}/api/organization/application#upload-application`,
      },
    },
  },
  management: {
    organization: {
      _index: () => `${DoguDocsUrl._index()}/management/organization`,
      'device-farm': {
        'device-management': {
          _index: () => `${DoguDocsUrl._index()}/management/organization/device-farm/device-management`,
          _heading: {
            'update-device-settings': () =>
              `${DoguDocsUrl._index()}/management/organization/device-farm/device-management#update-device-settings`,
          },
        },
        'tag-management': () => `${DoguDocsUrl._index()}/management/organization/device-farm/tag-management`,
        'host-management': () => `${DoguDocsUrl._index()}/management/organization/device-farm/host-management`,
      },
      'git-integration': {
        _index: () => `${DoguDocsUrl._index()}/management/organization/git-integration`,
        _heading: {
          prerequisites: () => `${DoguDocsUrl._index()}/management/organization/git-integration#prerequisites`,
        },
        bitbucket: () => `${DoguDocsUrl._index()}/management/organization/git-integration/bitbucket`,
        github: () => `${DoguDocsUrl._index()}/management/organization/git-integration/github`,
        gitlab: () => `${DoguDocsUrl._index()}/management/organization/git-integration/gitlab`,
      },
      app: () => `${DoguDocsUrl._index()}/management/organization/app`,
      team: () => `${DoguDocsUrl._index()}/management/organization/team`,
    },
    project: {
      _index: () => `${DoguDocsUrl._index()}/management/project`,
      routine: () => `${DoguDocsUrl._index()}/management/project/routine`,
      device: () => `${DoguDocsUrl._index()}/management/project/device`,
      member: () => `${DoguDocsUrl._index()}/management/project/member`,
    },
  },
  'device-farm': {
    _index: () => `${DoguDocsUrl._index()}/device-farm`,
    device: {
      settings: () => `${DoguDocsUrl._index()}/device-farm/device/settings`,
      'streaming-and-remote-control': {
        'ui-inspector': () => `${DoguDocsUrl._index()}/device-farm/device/streaming-and-remote-control/ui-inspector`,
      },
      'trouble-shooting': () => `${DoguDocsUrl._index()}/device-farm/device/trouble-shooting`,
    },
    host: {
      _index: () => `${DoguDocsUrl._index()}/device-farm/host`,
      windows: {
        installation: () => `${DoguDocsUrl._index()}/device-farm/host/windows/installation`,
      },
      macos: {
        installation: () => `${DoguDocsUrl._index()}/device-farm/host/macos/installation`,
      },
    },
  },
  routine: {
    routines: {
      _index: () => `${DoguDocsUrl._index()}/routine/routines`,
      syntax: () => `${DoguDocsUrl._index()}/routine/routines/syntax`,
    },
  },
  'test-automation': {
    _index: () => `${DoguDocsUrl._index()}/test-automation`,
    appium: () => `${DoguDocsUrl._index()}/test-automation/appium`,
    gamium: () => `${DoguDocsUrl._index()}/test-automation/gamium`,
    selenium: () => `${DoguDocsUrl._index()}/test-automation/selenium`,
  },
  'test-report': {
    _index: () => `${DoguDocsUrl._index()}/test-report`,
  },
};
