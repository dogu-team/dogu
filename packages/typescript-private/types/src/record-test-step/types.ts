export const RECORD_TEST_STEP_TABLE_NAME = 'record_test_step';
export type RecordTestStepId = string;
export enum RECORD_TEST_STEP_ACTION_TYPE {
  UNSPECIFIED = 0,
  WEBDRIVER_CLICK = 1,
  WEBDRIVER_INPUT = 2,
  // ...
}
