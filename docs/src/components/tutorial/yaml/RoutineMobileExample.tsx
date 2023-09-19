import CodeBlock from '@theme/CodeBlock';
import React from 'react';

export function RoutineMobileExample(option: {
  name: string;
  environment: 'python' | 'node';
  androidAppPackageName: string;
  androidCommand: string;
  iosAppPackageName: string;
  iosCommand: string;
  cwd: string;
}) {
  let prepareCommand = 'npm install';
  if (option.environment === 'python') {
    prepareCommand = 'pip3 install -r requirements.txt';
  }
  const text = `name: ${option.name}

on:
  workflow_dispatch:

jobs:
  # By default, jobs run concurrently.
  test-android:
    runs-on:
      # Through group execution, the tests will be run on all devices with these tags.
      group:
        - android
    appPackageName:
      android: ${option.androidAppPackageName}
    record: true
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          environment: ${option.environment}
          command: |
            ${prepareCommand}
            ${option.androidCommand}
        cwd: ${option.cwd}

  test-ios:
    runs-on:
      group:
        - ios
    appPackageName:
      ios: ${option.iosAppPackageName}
    record: true
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          environment: ${option.environment}
          command: |
            ${prepareCommand}
            ${option.iosCommand}
        cwd: ${option.cwd}
  `;
  return <CodeBlock language="yaml">{text}</CodeBlock>;
}
