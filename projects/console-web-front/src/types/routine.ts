import { TabsProps } from 'antd';

export enum ResultTabMenuKey {
  RECORD = 'record',
  TESTS = 'tests',
  DEVICE_LOGS = 'device-logs',
  TEST_LOGS = 'test-logs',
  PROFILE = 'profile',
}

export type ResultTabMenuItemType = TabsProps['items'] & { key: ResultTabMenuKey }[];

export enum RoutineEditMode {
  GUI = 'gui',
  SCRIPT = 'script',
  PREVIEW = 'preview',
}

export enum RoutineGUIEditorNodeType {
  JOB = 'job',
  STEP_GROUP = 'step-group',
  STEP = 'step',
}

export const PREPARE_ACTION_NAME = 'dogu-actions/prepare';
export const RUN_TEST_ACTION_NAME = 'dogu-actions/run-test';
export const CHECKOUT_ACTION_NAME = 'dogu-actions/checkout';
