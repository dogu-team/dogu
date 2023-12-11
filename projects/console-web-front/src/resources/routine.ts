import { PROJECT_TYPE } from '@dogu-private/types';

export const CLOUD_LINUX_DEVICE_NAME = 'cloud-ubuntu';

export const APP_ROUTINE_SAMPLE = `name: sample-routine

on:
  workflow_dispatch:

jobs:
  new-job-1:
    runs-on:
      group: []
    appPackageName:
    record: true
    cloud: true
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          clean: true
          command:
        cwd:
`;

export const WEB_ROUTINE_SAMPLE = `name: sample-routine

on:
  workflow_dispatch:

jobs:
  new-job-1:
    runs-on: []
    browserName: chrome
    record: true
    cloud: true
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          clean: true
          command:
        cwd:
`;

export const CLOUD_APP_ROUTINE_SAMPLE = `name: sample-routine

on:
  workflow_dispatch:

jobs:
  new-job-1:
    runs-on:
      group: []
    appPackageName:
    record: true
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          clean: true
          command:
        cwd:
`;

export const CLOUD_WEB_ROUTINE_SAMPLE = `name: sample-routine

on:
  workflow_dispatch:

jobs:
  new-job-1:
    runs-on: ${CLOUD_LINUX_DEVICE_NAME}
    browserName: chrome
    record: true
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          command:
        cwd:
`;

export const getSampleRoutine = (projectType: PROJECT_TYPE): string => {
  // if (IS_CLOUD) {
  //   if (projectType === PROJECT_TYPE.WEB) {
  //     return CLOUD_WEB_ROUTINE_SAMPLE;
  //   } else {
  //     return CLOUD_APP_ROUTINE_SAMPLE;
  //   }
  // } else {
  if (projectType === PROJECT_TYPE.WEB) {
    return WEB_ROUTINE_SAMPLE;
  } else {
    return APP_ROUTINE_SAMPLE;
  }
  // }
};
