export const RECORD_TEST_STEP_ACTION_TABLE_NAME = 'record_test_step_action';
export type RecordTestStepActionId = string;
export enum RECORD_TEST_STEP_ACTION_TYPE {
  UNSPECIFIED = 0,
  WEBDRIVER_CLICK = 1,
  WEBDRIVER_INPUT = 2,
  // ...
}
