export const RECORD_TEST_STEP_TABLE_NAME = 'record_test_step';
export type RecordTestStepId = string;

export const RecordTestActionTypes = ['UNSPECIFIED', 'WEBDRIVER_CLICK', 'WEBDRIVER_INPUT'] as const;
export type RecordTestActionType = (typeof RecordTestActionTypes)[number];

export enum RECORD_TEST_STEP_ACTION_TYPE {
  UNSPECIFIED = 0,
  WEBDRIVER_CLICK = 1,
  WEBDRIVER_INPUT = 2,
  // ...
}

export function recordTestStepActionTypeFromString(type: RecordTestActionType): RECORD_TEST_STEP_ACTION_TYPE {
  switch (type) {
    case 'UNSPECIFIED':
      return RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED;
    case 'WEBDRIVER_CLICK':
      return RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_CLICK;
    case 'WEBDRIVER_INPUT':
      return RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_INPUT;
    default:
      throw new Error(`Unknown RECORD_TEST_STEP_ACTION_TYPE: ${type}`);
  }
}

// export enum RECORD_TEST_STEP_TYPE_STRING {
//   UNSPECIFIED = 'UNSPECIFIED',
//   WEBDRIVER_CLICK = 'WEBDRIVER_CLICK',
//   WEBDRIVER_INPUT = 'WEBDRIVER_INPUT',
//   // ...
// }
