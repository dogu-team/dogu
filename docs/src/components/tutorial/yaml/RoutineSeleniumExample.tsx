import CodeBlock from '@theme/CodeBlock';
import React from 'react';

export function RoutineSeleniumExample(option: {
  runsOn: string;
  environment: 'python' | 'node';
  command: string;
  cwd: string;
}) {
  let prepareCommand = 'npm install';
  if (option.environment === 'python') {
    prepareCommand = 'pip3 install -r requirements.txt';
  }
  const text = `name: cross-browsing-testing-${option.environment}-${option.runsOn}

on:
  workflow_dispatch:

jobs:
  test-chrome:
    runs-on: ${option.runsOn}
    browserName: chrome
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          environment: ${option.environment}
          command: |-
            ${prepareCommand}
            ${option.command}
        cwd: ${option.cwd}
    record: true

  test-firefox:
    runs-on: ${option.runsOn}
    browserName: firefox
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          environment: ${option.environment}
          command: |-
            ${prepareCommand}
            ${option.command}
        cwd: ${option.cwd}
    record: true

  test-edge:
    runs-on: ${option.runsOn}
    browserName: edge
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          environment: ${option.environment}
          command: |-
            ${prepareCommand}
            ${option.command}
        cwd: ${option.cwd}
    record: true

  test-safari:
    runs-on: ${option.runsOn}
    browserName: safari
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          environment: ${option.environment}
          command: |-
            ${prepareCommand}
            ${option.command}
        cwd: ${option.cwd}
    record: true
  `;
  return <CodeBlock language="yaml">{text}</CodeBlock>;
}
